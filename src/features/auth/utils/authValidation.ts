const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export const authFieldRules = {
  email: {
    required: 'Email is required',
    pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
  },
  password: {
    required: 'Password is required',
  },
  passwordMin8: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
  },
  name: {
    required: 'Name is required',
  },
  otp: {
    required: 'Verification code is required',
    minLength: { value: 6, message: 'Enter the 6-digit code' },
    maxLength: { value: 6, message: 'Enter the 6-digit code' },
  },
};

export function confirmPasswordRule(password: string) {
  return {
    required: 'Confirm your password',
    validate: (value: string) => value === password || 'Passwords do not match',
  };
}
