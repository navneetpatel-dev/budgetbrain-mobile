import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/shared/constants/config';
import type { DetectionTransport } from '../../types/transactionDetection.types';

/**
 * Headless transport (plan T2.5): plain `fetch` with the stored access token. It doesn't load
 * the axios client, whose interceptors import the Redux store. An expired token fails the
 * request; the items stay pending and the foreground app sends them after it refreshes.
 */
const ACCESS_TOKEN_KEY = 'access_token';
const TIMEOUT_MS = 15000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (!token) throw new Error('Not signed in');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = (await response.json()) as { data: T };
    return body.data;
  } finally {
    clearTimeout(timer);
  }
}

export const headlessTransport: DetectionTransport = {
  async isOnline() {
    const net = await NetInfo.fetch();
    return Boolean(net.isConnected) && net.isInternetReachable !== false;
  },
  syncBatch: (items, idempotencyKey) =>
    request('/detected-transactions/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  fetchConfig: () => request('/detected-transactions/config'),
};
