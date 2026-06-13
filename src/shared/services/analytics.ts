import PostHog from 'posthog-react-native';

let posthog: PostHog | null = null;

export function initAnalytics(): PostHog | null {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  posthog = new PostHog(apiKey, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  });

  return posthog;
}

export function getAnalytics(): PostHog | null {
  return posthog;
}

export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  posthog?.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, string | number | boolean>) {
  posthog?.identify(userId, traits);
}

export function resetAnalytics() {
  posthog?.reset();
}
