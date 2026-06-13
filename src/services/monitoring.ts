/**
 * Mobile Sentry integration is optional.
 * Install @sentry/react-native and set EXPO_PUBLIC_SENTRY_DSN to enable.
 * Backend Sentry is configured via SENTRY_DSN in backend/.env
 */
export async function initMonitoring(): Promise<void> {
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) return;
  if (__DEV__) {
    console.log('[Monitoring] Set up @sentry/react-native for production error tracking');
  }
}

export function captureError(_error: Error, _context?: Record<string, string | number | boolean>): void {
  // Wire to @sentry/react-native when installed
}
