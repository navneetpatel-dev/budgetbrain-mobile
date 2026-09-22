import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog.component';
import type { ConfirmCopy } from '@/shared/constants/confirmations';
import { registerConfirmHandlers } from '@/shared/utils/confirmations';

type PendingConfirm = ConfirmCopy & {
  onConfirm: () => void | Promise<void>;
  alertOnly?: boolean;
};

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    registerConfirmHandlers({
      showConfirmation: (copy, onConfirm) => {
        setPending({ ...copy, onConfirm, alertOnly: false });
      },
      showAlert: (title, message) => {
        setPending({
          title,
          message,
          confirmLabel: 'OK',
          onConfirm: () => {},
          alertOnly: true,
        });
      },
    });
    return () => {
      mounted.current = false;
      registerConfirmHandlers(null);
    };
  }, []);

  const close = useCallback(() => {
    if (!loading) setPending(null);
  }, [loading]);

  const accept = useCallback(async () => {
    if (!pending) return;
    setLoading(true);
    try {
      await pending.onConfirm();
      if (mounted.current) setPending(null);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [pending]);

  return (
    <>
      {children}
      <ConfirmDialog
        open={pending != null}
        copy={pending}
        loading={loading}
        alertOnly={pending?.alertOnly}
        onCancel={close}
        onConfirm={() => { void accept(); }}
      />
    </>
  );
}
