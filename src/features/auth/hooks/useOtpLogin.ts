import { useState } from 'react';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { persistAuthSession, requestOtpCode, verifyOtpCode } from '@/features/auth/services/auth.service';

export function useOtpLogin() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const requestOtp = async (email: string) => {
    setLoading(true);
    try {
      await requestOtpCode(email);
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const session = await verifyOtpCode({ email, otp });
      await persistAuthSession(session);
      dispatch(setUser(session.user));
    } finally {
      setLoading(false);
    }
  };

  return { loading, otpSent, requestOtp, verifyOtp };
}
