import { getApiErrorMessage } from '@/shared/services/api';
import type { SocialAuthProvider } from '@/features/auth/types/auth.types';

const PROVIDER_LABEL: Record<SocialAuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

/** User dismissed the provider flow — no error banner. */
export function isSocialAuthCancellation(err: unknown): boolean {
  if (!err) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('cancel')
      || msg.includes('dismiss')
      || msg.includes('popup_closed')
      || msg.includes('user closed')
      || msg.includes('err_request_canceled')
    );
  }
  return false;
}

function isConfigError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('google_client_id')
    || msg.includes('vite_google_client_id')
    || msg.includes('expo_public_google_client_id')
    || msg.includes('not configured')
  );
}

/** User-facing copy for app/backend social sign-in failures. Returns null when the user cancelled. */
export function getSocialAuthErrorMessage(
  provider: SocialAuthProvider,
  err: unknown,
): string | null {
  if (isSocialAuthCancellation(err)) return null;

  const label = PROVIDER_LABEL[provider];

  if (isConfigError(err)) {
    return `${label} sign-in is temporarily unavailable. Please use email and password, or try again later.`;
  }

  return getApiErrorMessage(
    err,
    `We couldn't sign you in with ${label}. Please try again or use another sign-in method.`,
  );
}

export function getSocialAuthConfigError(provider: SocialAuthProvider): string {
  const label = PROVIDER_LABEL[provider];
  return `${label} sign-in is temporarily unavailable. Please use email and password, or try again later.`;
}
