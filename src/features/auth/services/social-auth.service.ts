import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { apiPost } from '@/shared/services/api';
import type { AuthSession as AuthSessionResult } from '@/features/auth/types/auth.types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export async function signInWithGoogle(): Promise<AuthSessionResult | null> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Set EXPO_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in');
  }

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'expenseflow' });
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };

  const authRequest = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
    usePKCE: false,
  });

  const result = await authRequest.promptAsync(discovery);
  if (result.type !== 'success' || !result.params.id_token) {
    return null;
  }

  return apiPost<AuthSessionResult>('/auth/google', {
    idToken: result.params.id_token,
    name: result.params.name as string | undefined,
  });
}

export async function signInWithApple(): Promise<AuthSessionResult | null> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }

  const AppleAuthentication = await import('expo-apple-authentication');
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    return null;
  }

  const name = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
    : undefined;

  return apiPost<AuthSessionResult>('/auth/apple', {
    idToken: credential.identityToken,
    name,
  });
}
