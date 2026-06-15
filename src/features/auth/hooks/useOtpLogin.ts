import { useState, useCallback } from 'react';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { getApiErrorMessage } from '@/shared/services/api';
import { persistAuthSession, requestOtpCode, verifyOtpCode } from '@/features/auth/services/auth.service';

export function useOtpLogin() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearInfo = useCallback(() => setInfo(null), []);

  const requestOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await requestOtpCode(email);
      setOtpSent(true);
      setInfo('Check your email for the 6-digit code.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send verification code'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await verifyOtpCode({ email, otp });
      await persistAuthSession(session);
      dispatch(setUser(session.user));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid verification code'));
    } finally {
      setLoading(false);
    }
  };

  return { loading, otpSent, error, info, clearError, clearInfo, requestOtp, verifyOtp };
}
