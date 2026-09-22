import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { getApiErrorCode } from '@/shared/services/api';
import { persistAuthSession } from '@/features/auth/api/auth.api';
import { appHref } from '@/shared/utils/navigation';
import { acceptFamilyInviteRequest, resolveAcceptErrorMessage } from '../api/familyInvite.api';

type AcceptStatus = 'pending' | 'success' | 'error';

/** Accepting is public (the token is the credential) — this can create a brand-new,
 *  passwordless account, so it always overwrites whatever session is currently stored,
 *  the same way any other login method would. */
export function useAcceptFamilyInvite(token: string | undefined) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // A missing token is knowable synchronously at mount — deriving it in the initializer
  // (rather than setState-in-effect) avoids an extra cascading render for that case.
  const [status, setStatus] = useState<AcceptStatus>(() => (token ? 'pending' : 'error'));
  const [error, setError] = useState<string | null>(() =>
    token ? null : 'This invite link is missing a token.'
  );
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        const session = await acceptFamilyInviteRequest(token);
        await persistAuthSession(session);
        dispatch(setUser(session.user));
        setStatus('success');
        router.replace(appHref('/family'));
      } catch (err) {
        setStatus('error');
        setError(resolveAcceptErrorMessage(getApiErrorCode(err)));
      }
    })();
  }, [token, dispatch, router]);

  return { status, error };
}
