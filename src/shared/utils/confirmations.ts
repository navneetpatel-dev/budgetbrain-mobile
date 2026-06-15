import type { ConfirmCopy } from '@/shared/constants/confirmations';

type Handlers = {
  showConfirmation: (copy: ConfirmCopy, onConfirm: () => void | Promise<void>) => void;
  showAlert: (title: string, message: string) => void;
};

let handlers: Handlers | null = null;

export function registerConfirmHandlers(next: Handlers | null) {
  handlers = next;
}

/** Custom confirmation dialog — matches web ConfirmDialog UX. */
export function showConfirmation(
  copy: ConfirmCopy,
  onConfirm: () => void | Promise<void>,
): void {
  if (handlers) {
    handlers.showConfirmation(copy, onConfirm);
    return;
  }
  onConfirm();
}

/** Single-button alert dialog — replaces native Alert for errors/info. */
export function showAlert(title: string, message: string): void {
  handlers?.showAlert(title, message);
}
