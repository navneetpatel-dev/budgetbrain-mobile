/**
 * Keep in sync with backend/src/validation/limits.ts + messages.ts
 * Frontend first gate; backend Zod is the authoritative gate (same copy).
 */

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
  inviteCode: { min: 6, max: 20 },
  subject: { min: 3, max: 255 },
  message: { min: 10, max: 5000 },
  aiMessage: { min: 1, max: 4000 },
  smsContent: { min: 10, max: 10000 },
  emailSubject: { min: 1, max: 255 },
  emailBody: { min: 10, max: 50000 },
  salaryRange: { min: 1, max: 50 },
} as const;

export const MAX_MONEY_AMOUNT = 9_999_999_999_999.99;
export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'] as const;

export type FieldLimitKey = keyof typeof FieldLimits;

/** Same strings as backend ValidationMessages */
export const ValidationMessages = {
  minChars: (min: number) => `Must be at least ${min} characters`,
  maxChars: (max: number) => `Must be at most ${max} characters`,
  emailRequired: 'Email is required',
  emailMax: `Email must be at most ${FieldLimits.email.max} characters`,
  emailInvalid: 'Enter a valid email address',
  passwordRequired: 'Password is required',
  passwordMin: `Password must be at least ${FieldLimits.password.min} characters`,
  passwordMax: `Password must be at most ${FieldLimits.password.max} characters`,
  passwordLetter: 'Password must include a letter',
  passwordNumber: 'Password must include a number',
  passwordConfirmRequired: 'Confirm your password',
  passwordMismatch: 'Passwords do not match',
  otpInvalid: 'Enter the 6-digit code',
  currencyInvalid: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
  dateFormat: 'Date must be YYYY-MM-DD',
  dateInvalid: 'Invalid date',
  amountType: 'Amount must be a number',
  amountFinite: 'Amount must be a finite number',
  amountPositive: 'Amount must be greater than zero',
  amountMax: `Amount must be at most ${MAX_MONEY_AMOUNT}`,
  valueType: 'Value must be a number',
  valueFinite: 'Value must be a finite number',
  inviteCodeInvalid: 'Invalid invite code',
  last4Invalid: 'Last 4 digits must be numeric',
  urlInvalid: 'Enter a valid URL',
} as const;

export function maxLen(key: FieldLimitKey): number {
  return FieldLimits[key].max;
}

export function minLen(key: FieldLimitKey): number {
  return FieldLimits[key].min;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Imperative text check — same messages as backend requiredText. */
export function validateText(key: FieldLimitKey, value: string | undefined | null): string | undefined {
  const { min, max } = FieldLimits[key];
  const v = (value ?? '').trim();
  if (v.length < min) return ValidationMessages.minChars(min);
  if (v.length > max) return ValidationMessages.maxChars(max);
  return undefined;
}

/** Imperative optional text — same as backend optionalText. */
export function validateOptionalText(
  key: FieldLimitKey,
  value: string | undefined | null
): string | undefined {
  const { min, max } = FieldLimits[key];
  const v = (value ?? '').trim();
  if (!v) return undefined;
  if (v.length < min) return ValidationMessages.minChars(min);
  if (v.length > max) return ValidationMessages.maxChars(max);
  return undefined;
}

/** Positive money amount — same as backend amountField. */
export function validateAmount(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null || value === '') {
    return ValidationMessages.amountPositive;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return ValidationMessages.amountType;
  if (!Number.isFinite(n)) return ValidationMessages.amountFinite;
  if (n <= 0) return ValidationMessages.amountPositive;
  if (n > MAX_MONEY_AMOUNT) return ValidationMessages.amountMax;
  return undefined;
}

/** Money value allowing zero (and optionally negative) — same as backend moneyValueField. */
export function validateMoneyValue(
  value: string | number | undefined | null,
  opts?: { allowNegative?: boolean }
): string | undefined {
  if (value === undefined || value === null || value === '') {
    return ValidationMessages.valueType;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return ValidationMessages.valueType;
  if (!Number.isFinite(n)) return ValidationMessages.valueFinite;
  const min = opts?.allowNegative ? -MAX_MONEY_AMOUNT : 0;
  if (n < min || n > MAX_MONEY_AMOUNT) {
    return ValidationMessages.amountMax;
  }
  return undefined;
}

export function validateDate(value: string | undefined | null): string | undefined {
  const v = (value ?? '').trim();
  if (!v) return ValidationMessages.dateFormat;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return ValidationMessages.dateFormat;
  if (!isValidIsoDate(v)) return ValidationMessages.dateInvalid;
  return undefined;
}

export function validateInviteCode(value: string | undefined | null): string | undefined {
  const v = (value ?? '').trim();
  if (!/^[a-fA-F0-9]{6,20}$/.test(v)) return ValidationMessages.inviteCodeInvalid;
  return undefined;
}

export function validateLast4(value: string | undefined | null): string | undefined {
  const v = (value ?? '').trim();
  if (!v) return undefined;
  if (!/^\d{4}$/.test(v)) return ValidationMessages.last4Invalid;
  return undefined;
}

/**
 * react-hook-form rules aligned with backend requiredText / optionalText messages.
 */
export function textRules(key: FieldLimitKey, opts?: { required?: boolean }) {
  const { min, max } = FieldLimits[key];
  const minMsg = ValidationMessages.minChars(min);
  const maxMsg = ValidationMessages.maxChars(max);
  return {
    ...(opts?.required !== false
      ? {
          required: minMsg,
          minLength: { value: min, message: minMsg },
        }
      : {
          minLength: { value: min, message: minMsg },
        }),
    maxLength: { value: max, message: maxMsg },
  };
}

/** Optional field: only enforce min when non-empty; always enforce max. */
export function optionalTextRules(key: FieldLimitKey) {
  const { min, max } = FieldLimits[key];
  return {
    validate: (value: string | undefined) => {
      const err = validateOptionalText(key, value);
      return err ?? true;
    },
    maxLength: { value: max, message: ValidationMessages.maxChars(max) },
  };
}

export function amountRules(opts?: { required?: boolean }) {
  return {
    ...(opts?.required !== false
      ? { required: ValidationMessages.amountPositive }
      : {}),
    validate: (value: string | number | undefined) => {
      if (value === undefined || value === null || value === '') {
        return opts?.required === false ? true : ValidationMessages.amountPositive;
      }
      return validateAmount(value) ?? true;
    },
  };
}

export function moneyValueRules(opts?: { allowNegative?: boolean; required?: boolean }) {
  return {
    ...(opts?.required !== false ? { required: ValidationMessages.valueType } : {}),
    validate: (value: string | number | undefined) => {
      if (value === undefined || value === null || value === '') {
        return opts?.required === false ? true : ValidationMessages.valueType;
      }
      return validateMoneyValue(value, opts) ?? true;
    },
  };
}

export function dateRules() {
  return {
    required: ValidationMessages.dateFormat,
    validate: (value: string | undefined) => validateDate(value) ?? true,
  };
}

export function inviteCodeRules() {
  return {
    required: ValidationMessages.inviteCodeInvalid,
    validate: (value: string | undefined) => validateInviteCode(value) ?? true,
    maxLength: {
      value: FieldLimits.inviteCode.max,
      message: ValidationMessages.maxChars(FieldLimits.inviteCode.max),
    },
  };
}

export function last4Rules() {
  return {
    validate: (value: string | undefined) => validateLast4(value) ?? true,
    maxLength: { value: 4, message: ValidationMessages.last4Invalid },
  };
}
