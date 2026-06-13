import { apiPost, setTokens, getApiErrorMessage } from '@/src/shared/services/api';
import type {
  AuthSession,
  ForgotPasswordInput,
  LoginCredentials,
  OtpVerifyInput,
  RegisterCredentials,
  ResetPasswordInput,
} from '@/src/features/auth/types/auth.types';

export async function persistAuthSession(session: AuthSession): Promise<void> {
  await setTokens(session.accessToken, session.refreshToken);
}

export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    return await apiPost<AuthSession>('/auth/login', credentials);
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Invalid credentials'));
  }
}

export async function registerAccount(credentials: RegisterCredentials): Promise<AuthSession> {
  try {
    return await apiPost<AuthSession>('/auth/register', credentials);
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Could not create account'));
  }
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
  try {
    await apiPost('/auth/forgot-password', input);
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Could not send reset email'));
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  if (!input.token) {
    throw new Error('Reset token is missing. Open the link from your email.');
  }
  try {
    await apiPost('/auth/reset-password', input);
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Could not reset password'));
  }
}

export async function requestOtpCode(email: string): Promise<void> {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  try {
    await apiPost('/auth/otp/request', { email });
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Could not send OTP'));
  }
}

export async function verifyOtpCode(input: OtpVerifyInput): Promise<AuthSession> {
  try {
    return await apiPost<AuthSession>('/auth/otp/verify', input);
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Invalid OTP'));
  }
}

export async function verifyEmailToken(token: string): Promise<void> {
  if (!token) {
    throw new Error('No verification token found.');
  }
  try {
    await apiPost('/auth/verify-email', { token });
  } catch {
    throw new Error('This verification link is invalid or expired.');
  }
}
