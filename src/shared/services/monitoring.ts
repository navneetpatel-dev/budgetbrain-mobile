let initialized = false;
let captureFn: ((error: Error) => void) | null = null;

export async function initMonitoring(): Promise<void> {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || initialized) return;

  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.init({
      dsn,
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      enableAutoSessionTracking: true,
    });
    captureFn = (error: Error) => Sentry.captureException(error);
    initialized = true;
  } catch {
    // @sentry/react-native not installed
  }
}

export function captureError(error: Error, context?: Record<string, string | number | boolean>): void {
  if (!captureFn) return;
  if (context) {
    import('@sentry/react-native').then((Sentry) => {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
        Sentry.captureException(error);
      });
    });
    return;
  }
  captureFn(error);
}
