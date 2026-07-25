import { FieldLimits, ValidationMessages, maxLen } from '../../../shared/validation/fieldLimits';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authFieldRules = {
  email: {
    required: ValidationMessages.emailRequired,
    maxLength: { value: FieldLimits.email.max, message: ValidationMessages.emailMax },
    pattern: { value: EMAIL_PATTERN, message: ValidationMessages.emailInvalid },
  },
  password: {
    required: ValidationMessages.passwordRequired,
    maxLength: { value: FieldLimits.password.max, message: ValidationMessages.passwordMax },
  },
  passwordMin8: {
    required: ValidationMessages.passwordRequired,
    minLength: { value: FieldLimits.password.min, message: ValidationMessages.passwordMin },
    maxLength: { value: FieldLimits.password.max, message: ValidationMessages.passwordMax },
    validate: (value: string) => {
      if (!/[A-Za-z]/.test(value)) return ValidationMessages.passwordLetter;
      if (!/[0-9]/.test(value)) return ValidationMessages.passwordNumber;
      return true;
    },
  },
  name: {
    required: ValidationMessages.minChars(FieldLimits.name.min),
    minLength: {
      value: FieldLimits.name.min,
      message: ValidationMessages.minChars(FieldLimits.name.min),
    },
    maxLength: {
      value: FieldLimits.name.max,
      message: ValidationMessages.maxChars(FieldLimits.name.max),
    },
  },
  otp: {
    required: ValidationMessages.otpInvalid,
    minLength: { value: 6, message: ValidationMessages.otpInvalid },
    maxLength: { value: 6, message: ValidationMessages.otpInvalid },
    pattern: { value: /^\d{6}$/, message: ValidationMessages.otpInvalid },
  },
};

export function confirmPasswordRule(password: string) {
  return {
    required: ValidationMessages.passwordConfirmRequired,
    maxLength: { value: FieldLimits.password.max, message: ValidationMessages.passwordMax },
    validate: (value: string) => value === password || ValidationMessages.passwordMismatch,
  };
}

export { maxLen, ValidationMessages, FieldLimits };
