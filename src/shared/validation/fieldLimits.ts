/**
 * Keep in sync with backend/src/shared/validation/{limits,messages,fields}.ts
 * Frontend first gate; backend Zod is the authoritative gate (same copy).
 */

export const FieldLimits = {
  email: { min: 1, max: 255 },
  password: { min: 8, max: 72 },
  name: { min: 1, max: 255 },
  otp: { min: 6, max: 6 },
  country: { min: 1, max: 100 },
  currency: { min: 3, max: 3 },
  avatarUrl: { min: 1, max: 500 },
  merchant: { min: 1, max: 255 },
  notes: { min: 1, max: 2000 },
  search: { min: 2, max: 100 },
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
  adminNotes: { min: 1, max: 5000 },
  aiMessage: { min: 1, max: 4000 },
  smsContent: { min: 10, max: 10000 },
  emailSubject: { min: 1, max: 255 },
  emailBody: { min: 10, max: 50000 },
  salaryRange: { min: 1, max: 50 },
  financialGoal: { min: 1, max: 100 },
  deviceName: { min: 1, max: 255 },
} as const;

export const MAX_MONEY_AMOUNT = 9_999_999_999_999.99;
export const MAX_QUANTITY = 1_000_000_000;
export const ALERT_THRESHOLD = { min: 1, max: 100 } as const;
export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'] as const;

export type FieldLimitKey = keyof typeof FieldLimits;

export const ValidationMessages = {
  minChars: (min: number) => `Must be at least ${min} characters`,
  maxChars: (max: number) => `Must be at most ${max} characters`,
  emailRequired: 'Email is required',
  emailMax: `Email must be at most ${FieldLimits.email.max} characters`,
  emailInvalid: 'Enter a valid email address',
  passwordRequired: 'Password is required',
  passwordMin: `Password must be at least ${FieldLimits.password.min} characters`,
  passwordMax: `Password must be at most ${FieldLimits.password.max} characters`,
  passwordAlphanumeric: 'Password must include a letter, a number, and a special character',
  passwordLetter: 'Password must include a letter',
  passwordNumber: 'Password must include a number',
  passwordSpecial: 'Password must include a special character',
  passwordNoSpaces: 'Password cannot contain spaces',
  passwordConfirmRequired: 'Confirm your password',
  passwordMismatch: 'Passwords do not match',
  otpInvalid: 'Enter the 6-digit code',
  currencyInvalid: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
  dateFormat: 'Date must be YYYY-MM-DD',
  dateInvalid: 'Invalid date',
  dateNotInFuture: 'Date cannot be in the future',
  dateNotInPast: 'Date cannot be in the past',
  dateTooFarInPast: 'Date is too far in the past',
  dateTooFarInFuture: 'Date is too far in the future',
  dateRangeOrder: 'Start date must be on or before end date',
  amountType: 'Amount must be a number',
  amountFinite: 'Amount must be a finite number',
  amountPositive: 'Amount must be greater than zero',
  amountMax: `Amount must be at most ${MAX_MONEY_AMOUNT}`,
  valueType: 'Value must be a number',
  valueFinite: 'Value must be a finite number',
  valueMin: (min: number) => `Value must be at least ${min}`,
  valueMax: (max: number) => `Value must be at most ${max}`,
  quantityType: 'Quantity must be a number',
  quantityFinite: 'Quantity must be a finite number',
  quantityPositive: 'Quantity must be greater than zero',
  quantityMax: `Quantity must be at most ${MAX_QUANTITY}`,
  alertThresholdType: 'Alert threshold must be a number',
  alertThresholdFinite: 'Alert threshold must be a finite number',
  alertThresholdMin: `Alert threshold must be at least ${ALERT_THRESHOLD.min}`,
  alertThresholdMax: `Alert threshold must be at most ${ALERT_THRESHOLD.max}`,
  inviteCodeInvalid: 'Invalid invite code',
  last4Invalid: 'Last 4 digits must be numeric',
  urlInvalid: 'Enter a valid URL',
  urlMax: (max: number) => `URL must be at most ${max} characters`,
  categoryRequired: 'Please select a category',
  endDateRequired: 'End date is required for custom budgets',
  endDateBeforeStart: 'End date must be on or after start date',
  incomeSourceRequired: 'Select an income source',
  financialGoalsMin: 'Please select at least one financial goal',
  financialGoalsMax: 'Must be at most 20 financial goals',
  enumInvalid: 'Invalid option',
  uuidInvalid: 'Invalid id',
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

export function validateText(key: FieldLimitKey, value: string | undefined | null): string | undefined {
  const { min, max } = FieldLimits[key];
  const v = (value ?? '').trim();
  if (v.length < min) return ValidationMessages.minChars(min);
  if (v.length > max) return ValidationMessages.maxChars(max);
  return undefined;
}

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
  if (n < min) return ValidationMessages.valueMin(min);
  if (n > MAX_MONEY_AMOUNT) return ValidationMessages.valueMax(MAX_MONEY_AMOUNT);
  return undefined;
}

export function validateQuantity(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null || value === '') {
    return ValidationMessages.quantityPositive;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return ValidationMessages.quantityType;
  if (!Number.isFinite(n)) return ValidationMessages.quantityFinite;
  if (n <= 0) return ValidationMessages.quantityPositive;
  if (n > MAX_QUANTITY) return ValidationMessages.quantityMax;
  return undefined;
}

export function validateAlertThreshold(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return ValidationMessages.alertThresholdType;
  if (!Number.isFinite(n)) return ValidationMessages.alertThresholdFinite;
  if (n < ALERT_THRESHOLD.min) return ValidationMessages.alertThresholdMin;
  if (n > ALERT_THRESHOLD.max) return ValidationMessages.alertThresholdMax;
  return undefined;
}

export function validateDate(value: string | undefined | null): string | undefined {
  const v = (value ?? '').trim();
  if (!v) return ValidationMessages.dateFormat;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return ValidationMessages.dateFormat;
  if (!isValidIsoDate(v)) return ValidationMessages.dateInvalid;
  return undefined;
}

export function validateOptionalDate(value: string | undefined | null): string | undefined {
  const v = (value ?? '').trim();
  if (!v) return undefined;
  return validateDate(v);
}

export type DateBoundKind =
  | 'transaction'
  | 'investmentPurchase'
  | 'goalTarget'
  | 'budgetStart'
  | 'budgetEnd'
  | 'range';

function todayLocalIso(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftYearsLocalIso(iso: string, years: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y + years, m - 1, d);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Format + feature bounds (mirrors backend date rules). */
export function validateBoundedDate(
  kind: DateBoundKind,
  value: string | undefined | null,
  opts?: { startDate?: string; optional?: boolean },
): string | undefined {
  const v = (value ?? '').trim();
  if (!v) return opts?.optional ? undefined : ValidationMessages.dateFormat;
  const formatErr = validateDate(v);
  if (formatErr) return formatErr;

  const today = todayLocalIso();
  if (kind === 'transaction') {
    if (v > today) return ValidationMessages.dateNotInFuture;
    if (v < shiftYearsLocalIso(today, -10)) return ValidationMessages.dateTooFarInPast;
  } else if (kind === 'investmentPurchase') {
    if (v > today) return ValidationMessages.dateNotInFuture;
    if (v < shiftYearsLocalIso(today, -50)) return ValidationMessages.dateTooFarInPast;
  } else if (kind === 'goalTarget') {
    if (v < today) return ValidationMessages.dateNotInPast;
    if (v > shiftYearsLocalIso(today, 50)) return ValidationMessages.dateTooFarInFuture;
  } else if (kind === 'budgetStart') {
    if (v < shiftYearsLocalIso(today, -2)) return ValidationMessages.dateTooFarInPast;
    if (v > shiftYearsLocalIso(today, 1)) return ValidationMessages.dateTooFarInFuture;
  } else if (kind === 'budgetEnd') {
    const start = (opts?.startDate ?? '').trim();
    if (start && v < start) return ValidationMessages.endDateBeforeStart;
    if (start && v > shiftYearsLocalIso(start, 5)) return ValidationMessages.dateTooFarInFuture;
  } else if (kind === 'range') {
    if (v > today) return ValidationMessages.dateNotInFuture;
    if (v < shiftYearsLocalIso(today, -10)) return ValidationMessages.dateTooFarInPast;
  }
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

export function optionalTextRules(key: FieldLimitKey) {
  const { max } = FieldLimits[key];
  return {
    validate: (value: string | undefined) => validateOptionalText(key, value) ?? true,
    maxLength: { value: max, message: ValidationMessages.maxChars(max) },
  };
}

export function amountRules(opts?: { required?: boolean }) {
  return {
    ...(opts?.required !== false ? { required: ValidationMessages.amountPositive } : {}),
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

export function quantityRules(opts?: { required?: boolean }) {
  return {
    ...(opts?.required !== false ? { required: ValidationMessages.quantityPositive } : {}),
    validate: (value: string | number | undefined) => {
      if (value === undefined || value === null || value === '') {
        return opts?.required === false ? true : ValidationMessages.quantityPositive;
      }
      return validateQuantity(value) ?? true;
    },
  };
}

export function alertThresholdRules(opts?: { required?: boolean }) {
  return {
    ...(opts?.required ? { required: ValidationMessages.alertThresholdMin } : {}),
    validate: (value: string | number | undefined) => {
      if (value === undefined || value === null || value === '') {
        return opts?.required ? ValidationMessages.alertThresholdMin : true;
      }
      return validateAlertThreshold(value) ?? true;
    },
  };
}

export function dateRules(kind: DateBoundKind = 'transaction') {
  return {
    required: ValidationMessages.dateFormat,
    validate: (value: string | undefined) => validateBoundedDate(kind, value) ?? true,
  };
}

export function optionalDateRules(kind: DateBoundKind = 'goalTarget') {
  return {
    validate: (value: string | undefined) =>
      validateBoundedDate(kind, value, { optional: true }) ?? true,
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
