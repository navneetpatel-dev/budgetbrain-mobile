/** Keep in sync with backend/src/validation/limits.ts */
export const FieldLimits = {
  email: { min: 1, max: 255 },
  password: { min: 8, max: 72 },
  name: { min: 1, max: 255 },
  otp: { min: 6, max: 6 },
  country: { min: 1, max: 100 },
  currency: { min: 3, max: 3 },
  merchant: { min: 1, max: 255 },
  notes: { min: 1, max: 2000 },
  search: { min: 1, max: 100 },
  entityName: { min: 1, max: 255 },
  categoryName: { min: 1, max: 100 },
  icon: { min: 1, max: 50 },
  color: { min: 1, max: 20 },
  institution: { min: 1, max: 255 },
  accountNumberLast4: { min: 4, max: 4 },
  symbol: { min: 1, max: 20 },
  inviteCode: { min: 1, max: 20 },
  subject: { min: 3, max: 255 },
  message: { min: 10, max: 5000 },
  aiMessage: { min: 1, max: 4000 },
  smsContent: { min: 10, max: 10000 },
  emailSubject: { min: 1, max: 255 },
  emailBody: { min: 10, max: 50000 },
  salaryRange: { min: 1, max: 50 },
} as const;

export type FieldLimitKey = keyof typeof FieldLimits;

export function maxLen(key: FieldLimitKey): number {
  return FieldLimits[key].max;
}

export function minLen(key: FieldLimitKey): number {
  return FieldLimits[key].min;
}

/** react-hook-form style rules from FieldLimits */
export function textRules(
  key: FieldLimitKey,
  opts?: { required?: string | boolean; label?: string }
) {
  const { min, max } = FieldLimits[key];
  const label = opts?.label ?? 'This field';
  return {
    ...(opts?.required
      ? { required: typeof opts.required === 'string' ? opts.required : `${label} is required` }
      : {}),
    minLength: { value: min, message: `${label} must be at least ${min} characters` },
    maxLength: { value: max, message: `${label} must be at most ${max} characters` },
  };
}
