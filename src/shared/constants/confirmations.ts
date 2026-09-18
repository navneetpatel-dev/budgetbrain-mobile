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
  deleteLoan: {
    title: 'Delete loan?',
    message: 'This loan and its payment history will be permanently removed. This action cannot be undone.',
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
  revokeDevice: (deviceName: string): ConfirmCopy => ({
    title: 'Sign out this device?',
    message: `"${deviceName}" will be signed out immediately and must sign in again to access your account.`,
    confirmLabel: 'Sign out device',
    cancelLabel: 'Cancel',
    destructive: true,
  }),
  removeFamilyMember: (name: string): ConfirmCopy => ({
    title: 'Remove member?',
    message: `Remove "${name}" from this family group?`,
    confirmLabel: 'Remove',
    cancelLabel: 'Cancel',
    destructive: true,
  }),
  deleteFamilyGroup: (name: string): ConfirmCopy => ({
    title: 'Delete family group?',
    message: `"${name}" and all split ledgers will be permanently deleted. This action cannot be undone.`,
    confirmLabel: 'Delete Group',
    cancelLabel: 'Cancel',
    destructive: true,
  }),
  transferFamilyOwnership: (name: string): ConfirmCopy => ({
    title: 'Transfer ownership?',
    message: `"${name}" will become the new owner of this group, and you will be demoted to admin. This cannot be undone by you alone.`,
    confirmLabel: 'Transfer',
    cancelLabel: 'Cancel',
    destructive: true,
  }),
} as const;
