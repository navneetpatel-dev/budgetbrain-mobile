import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { apiPost } from '@/shared/services/api';
import type { AuthSession as AuthSessionResult } from '@/features/auth/types/auth.types';

import Constants, { ExecutionEnvironment } from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function getWebGoogleClientId(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
  );
}

export function getGoogleClientId(): string | undefined {
  if (Platform.OS === 'web' && process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  }
  // Browser OAuth only works with a Web client ID. Android/iOS client IDs
  // sent to accounts.google.com produce Google's "Access blocked" page.
  if (isExpoGo || Platform.OS === 'web') {
    return getWebGoogleClientId();
  }
  if (Platform.OS === 'ios' && process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
    return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  }
  return getWebGoogleClientId();
}

export function getGoogleRedirectUri(): string {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
  }
  if (isExpoGo) {
    return 'https://auth.expo.io/@anonymous/budgetbrain';
  }
  return AuthSession.makeRedirectUri({
    scheme: 'budgetbrain',
    path: 'oauthredirect',
  });
}

async function signInWithGoogleNative(): Promise<AuthSessionResult | null> {
  const webClientId = getWebGoogleClientId();
  if (!webClientId) {
    throw new Error('EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured in mobile/.env');
  }

  const {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
  } = await import('@react-native-google-signin/google-signin');

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return null;
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      throw new Error('No authentication token returned by Google');
    }

    return apiPost<AuthSessionResult>('/auth/google', {
      idToken,
      name: response.data.user.name ?? undefined,
    });
  } catch (err) {
    if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    throw err;
  }
}

async function signInWithGoogleBrowser(): Promise<AuthSessionResult | null> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured in mobile/.env');
  }

  const redirectUri = getGoogleRedirectUri();

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  };

  const authRequest = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  const result = await authRequest.promptAsync(discovery);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    return null;
  }
  if (result.type !== 'success') {
    throw new Error('Google sign-in could not be completed');
  }

  let tokenToVerify: string | undefined;

  if (result.params.id_token) {
    tokenToVerify = result.params.id_token;
  } else if (result.params.code) {
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
        code: result.params.code,
        redirectUri,
        extraParams: {
          code_verifier: authRequest.codeVerifier ?? '',
        },
      },
      discovery
    );
    tokenToVerify = tokenResult.idToken || tokenResult.accessToken;
  } else if (result.params.access_token) {
    tokenToVerify = result.params.access_token;
  }

  if (!tokenToVerify) {
    throw new Error('No authentication token returned by Google');
  }

  return apiPost<AuthSessionResult>('/auth/google', {
    idToken: tokenToVerify,
    name: result.params.name as string | undefined,
  });
}

export async function signInWithGoogle(): Promise<AuthSessionResult | null> {
  if (!isExpoGo && Platform.OS === 'android') {
    return signInWithGoogleNative();
  }
  return signInWithGoogleBrowser();
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
