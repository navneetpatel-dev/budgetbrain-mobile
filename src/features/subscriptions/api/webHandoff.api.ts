import { Linking } from 'react-native';
import { apiPost } from '@/shared/services/api';
import { WEB_APP_URL } from '@/shared/constants/config';

export type WebUpgradePlan = 'monthly' | 'yearly' | 'lifetime';

interface HandoffTokenResponse {
  token: string;
  expiresAt: string;
}

/**
 * Mints a short-lived, single-use token from the backend and opens the web upgrade page in the
 * system browser, already signed in as the current user. All subscription payments happen on
 * web (Razorpay) — the app never processes a purchase itself. `plan` and `from=app` ride along
 * as plain query params (not part of the credential) so the web page can preselect the plan the
 * user picked here and show a "Return to app" action once checkout succeeds.
 */
export async function openWebUpgrade(plan: WebUpgradePlan): Promise<void> {
  const { token } = await apiPost<HandoffTokenResponse>('/auth/sso/handoff');
  const params = new URLSearchParams({ token, plan, from: 'app' });
  await Linking.openURL(`${WEB_APP_URL}/auth/handoff?${params.toString()}`);
}
