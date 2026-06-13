import type { User } from '@/src/shared/types';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface OtpVerifyInput {
  email: string;
  otp: string;
}

export type SocialAuthProvider = 'google' | 'apple';
