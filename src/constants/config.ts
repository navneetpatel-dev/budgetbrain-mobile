export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'] as const;

export const FINANCIAL_GOALS = [
  'Emergency Fund',
  'Vacation',
  'Home Purchase',
  'Car Purchase',
  'Investments',
  'Debt Payoff',
] as const;

export const SALARY_RANGES = [
  'Under ₹3L',
  '₹3L - ₹6L',
  '₹6L - ₹12L',
  '₹12L - ₹24L',
  'Above ₹24L',
] as const;

export const SUBSCRIPTION_PLANS = {
  monthly: { price: 199, label: 'Monthly', period: '/month' },
  yearly: { price: 1499, label: 'Yearly', period: '/year' },
  lifetime: { price: 3999, label: 'Lifetime', period: ' one-time' },
} as const;

export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};
