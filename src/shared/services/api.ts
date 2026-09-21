import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';
import { store } from '../store';
import { logout } from '../store/authSlice';
import type { ApiResponse } from '../types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  request: InternalAxiosRequestConfig;
}> = [];

async function endSession(): Promise<void> {
  await clearTokens();
  store.dispatch(logout());
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, request: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw error;

        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        await setTokens(data.data.accessToken, data.data.refreshToken);
        refreshQueue.forEach(({ resolve, request }) => {
          request.headers.Authorization = `Bearer ${data.data.accessToken}`;
          resolve(api(request));
        });
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        await endSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const code = (error.response?.data as { error?: { code?: string } })?.error?.code;
    if (error.response?.status === 403 && code === 'ONBOARDING_REQUIRED') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { router } = require('expo-router');
        router.replace('/(onboarding)');
      } catch {
        /* proceed */
      }
    }

    return Promise.reject(error);
  }
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data.data;
}

/** Thrown by apiPostStream for a non-2xx response — carries the backend's error code/message
 *  the same way an axios error would, so getApiErrorCode/getApiErrorMessage work uniformly. */
export class ApiStreamError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiStreamError';
    this.code = code;
  }
}

/**
 * POSTs to an SSE streaming endpoint using `expo/fetch` (axios/React Native's default
 * fetch does not reliably expose a readable response body; `expo/fetch` is Expo's
 * purpose-built streaming-capable fetch, see https://docs.expo.dev/versions/latest/sdk/expo/#fetch).
 * Calls `onDelta` per streamed token, then resolves with the final `{done: true, ...}` payload.
 */
export async function apiPostStream<T>(
  url: string,
  body: unknown,
  onDelta: (delta: string) => void
): Promise<T> {
  const { fetch: expoFetch } = await import('expo/fetch');
  const token = await getAccessToken();

  const response = await expoFetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    let message = `Request failed (${response.status})`;
    let code: string | undefined;
    try {
      const errBody = (await response.json()) as { error?: { message?: string; code?: string } };
      if (errBody.error?.message) message = errBody.error.message;
      code = errBody.error?.code;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiStreamError(message, code);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload: T | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;

      let parsed: { delta?: string; done?: boolean } & Record<string, unknown>;
      try {
        parsed = JSON.parse(payload);
      } catch {
        continue;
      }

      if (parsed.done) {
        finalPayload = parsed as T;
      } else if (typeof parsed.delta === 'string') {
        onDelta(parsed.delta);
      }
    }
  }

  if (!finalPayload) {
    throw new ApiStreamError('Stream ended without a completion event');
  }
  return finalPayload;
}

/** Extract the backend's machine-readable error code (e.g. 'AI_QUOTA_EXCEEDED'), if present. */
export function getApiErrorCode(err: unknown): string | undefined {
  if (err instanceof ApiStreamError) return err.code;
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: { code?: string } } | undefined)?.error?.code;
  }
  return undefined;
}

/** Extract a user-facing message from axios / API errors (prefers Zod field message). */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const apiError = (err.response?.data as ApiResponse<unknown> | undefined)?.error;
    const detailMessage = apiError?.details?.find((d) => d?.message)?.message;
    if (apiError?.message && apiError.message !== 'Validation failed') return apiError.message;
    if (detailMessage) return detailMessage;
    if (apiError?.message) return apiError.message;
    if (err.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (!err.response) {
      if (__DEV__) {
        return `Cannot reach the server at ${API_BASE_URL}. Update EXPO_PUBLIC_API_URL in mobile/.env to your computer's current LAN IP, then restart Expo (press r in the terminal).`;
      }
      return `Unable to reach the BudgetBrain server at ${API_BASE_URL}. Your internet is fine — the app could not talk to the API.`;
    }
    return `Request failed (${err.response.status})`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function apiDownloadText(url: string, params?: Record<string, string>): Promise<string> {
  const token = await getAccessToken();
  const search = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${API_BASE_URL}${url}${search}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Download failed');
  return response.text();
}

export async function apiDownloadBinary(
  url: string,
  params?: Record<string, string>
): Promise<ArrayBuffer> {
  const token = await getAccessToken();
  const search = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${API_BASE_URL}${url}${search}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Download failed');
  return response.arrayBuffer();
}
