import { useState } from 'react';
import { apiPost, setTokens, getApiErrorMessage } from '@/src/shared/services/api';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';
import type { User } from '@/src/shared/types';

export function useOtpLogin() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const requestOtp = async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    setLoading(true);
    try {
      await apiPost('/auth/otp/request', { email });
      setOtpSent(true);
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Could not send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/otp/verify',
        { email, otp }
      );
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Invalid OTP'));
    } finally {
      setLoading(false);
    }
  };

  return { loading, otpSent, requestOtp, verifyOtp };
}
