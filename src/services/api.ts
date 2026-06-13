import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';
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
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
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
        refreshQueue.forEach((cb) => cb(data.data.accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        await clearTokens();
        refreshQueue = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
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
