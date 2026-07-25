const EXACT: Record<string, string> = {
  'Sign In': 'Signing in…',
  'Create Account': 'Creating account…',
  'Send Reset Link': 'Sending reset link…',
  'Update Password': 'Updating password…',
  'Verify Email': 'Verifying email…',
  'Send Code': 'Sending code…',
  'Verify & Sign In': 'Verifying…',
  'Resend code': 'Resending code…',
  'Get Started': 'Saving…',
  'Complete Setup': 'Completing setup…',
  'Save Changes': 'Saving changes…',
  'Save Expense': 'Saving expense…',
  'Save Income': 'Saving income…',
  'Save profile': 'Saving profile…',
  'Create Goal': 'Creating goal…',
  'Create Budget': 'Creating budget…',
  'Add Contribution': 'Adding contribution…',
  'Add Account': 'Adding account…',
  'Update': 'Updating…',
  'Create': 'Creating…',
  'Submit Ticket': 'Submitting ticket…',
  'Create Group': 'Creating group…',
  'Join Group': 'Joining group…',
  'Parse SMS': 'Parsing SMS…',
  'Parse Email': 'Parsing email…',
  'Confirm as Expense': 'Confirming…',
  'Download CSV': 'Downloading…',
  'Delete': 'Deleting…',
  'Duplicate': 'Duplicating…',
  Google: 'Signing in…',
  Apple: 'Signing in…',
};

/** Present-tense label shown on buttons while an action is in progress. */
export function getLoadingLabel(actionLabel: string): string {
  if (EXACT[actionLabel]) return EXACT[actionLabel];
  if (actionLabel.startsWith('Add ')) return `Adding ${actionLabel.slice(4).toLowerCase()}…`;
  if (actionLabel.startsWith('Create ')) return `Creating ${actionLabel.slice(7).toLowerCase()}…`;
  if (actionLabel.startsWith('Save ')) return `Saving ${actionLabel.slice(5).toLowerCase()}…`;
  if (actionLabel.startsWith('Update ')) return `Updating ${actionLabel.slice(7).toLowerCase()}…`;
  if (actionLabel.startsWith('Send ')) return `Sending ${actionLabel.slice(5).toLowerCase()}…`;
  if (actionLabel.startsWith('Submit ')) return `Submitting ${actionLabel.slice(7).toLowerCase()}…`;
  if (actionLabel.startsWith('Join ')) return `Joining ${actionLabel.slice(5).toLowerCase()}…`;
  if (actionLabel.startsWith('Parse ')) return `Parsing ${actionLabel.slice(6).toLowerCase()}…`;
  if (actionLabel.startsWith('Download ')) return `Downloading ${actionLabel.slice(9).toLowerCase()}…`;
  return `${actionLabel}…`;
}

/** Spread onto text inputs while a form submit is in flight. */
export function fieldDisabledProps(disabled?: boolean) {
  if (!disabled) return {};
  return { disabled: true, editable: false as const };
}
