import { FieldLimits, textRules } from '../../../shared/validation/fieldLimits';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authFieldRules = {
  email: {
    ...textRules('email', { required: 'Email is required', label: 'Email' }),
    pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
  },
  password: {
    required: 'Password is required',
    maxLength: {
      value: FieldLimits.password.max,
      message: `Password must be at most ${FieldLimits.password.max} characters`,
    },
  },
  passwordMin8: {
    ...textRules('password', { required: 'Password is required', label: 'Password' }),
  },
  name: {
    ...textRules('name', { required: 'Name is required', label: 'Name' }),
  },
  otp: {
    ...textRules('otp', { required: 'Verification code is required', label: 'Code' }),
  },
};

export function confirmPasswordRule(password: string) {
  return {
    required: 'Confirm your password',
    maxLength: {
      value: FieldLimits.password.max,
      message: `Password must be at most ${FieldLimits.password.max} characters`,
    },
    validate: (value: string) => value === password || 'Passwords do not match',
  };
}
