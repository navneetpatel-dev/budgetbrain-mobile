import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';

export function confirmDeleteBudget(name: string, onConfirm: () => void) {
  showConfirmation(CONFIRM.deleteBudget(name), onConfirm);
}
