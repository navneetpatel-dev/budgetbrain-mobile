import { apiDelete, apiGet } from '@/shared/services/api';

export interface AccountDevice {
  id: string;
  deviceName: string | null;
  platform: string | null;
  lastActiveAt: string;
  createdAt: string;
}

/** GET /auth/devices — list every device with an active session for the current user. */
export function fetchDevices(): Promise<{ devices: AccountDevice[] }> {
  return apiGet<{ devices: AccountDevice[] }>('/auth/devices');
}

/** DELETE /auth/devices/:id — revoke a device's session (sign it out remotely). */
export function revokeDeviceById(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/auth/devices/${id}`);
}
