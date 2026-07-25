export interface ConfirmCopy {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export const CONFIRM = {
  signOut: {
    title: 'Sign out?',
    message: 'You will be signed out of budgetbrain on this device. You can sign back in anytime.',
    confirmLabel: 'Sign out',
    cancelLabel: 'Cancel',
  },
  deleteAccount: {
    title: 'Delete account?',
    message: 'This permanently deletes your budgetbrain account and all associated data, including transactions, budgets, and goals. This action cannot be undone.',
    confirmLabel: 'Delete account',
    cancelLabel: 'Keep account',
    destructive: true,
  },
  deleteExpense: {
    title: 'Delete expense?',
    message: 'This expense will be permanently removed. This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    destructive: true,
  },
  deleteIncome: {
    title: 'Delete income?',
    message: 'This income entry will be permanently removed. This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    destructive: true,
  },
  deleteBudget: (name: string): ConfirmCopy => ({
    title: 'Delete budget?',
    message: `"${name}" will be permanently removed. This action cannot be undone.`,
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    destructive: true,
  }),
  deleteGoal: {
    title: 'Delete goal?',
    message: 'This goal and its progress will be permanently removed. This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    destructive: true,
  },
  archiveCategory: (name: string): ConfirmCopy => ({
    title: 'Archive category?',
    message: `"${name}" will be archived and hidden from new transactions. You can restore it later if needed.`,
    confirmLabel: 'Archive',
    cancelLabel: 'Cancel',
    destructive: true,
  }),
} as const;
