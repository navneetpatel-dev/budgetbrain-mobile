import type { AppIconName } from '@/features/navigation/components/AppIcon.component';

export const PROFILE_FEATURE_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Goals', href: '/(tabs)/goals', icon: 'goals' },
  { label: 'Income', href: '/(tabs)/income', icon: 'income' },
  { label: 'AI Insights', href: '/(tabs)/ai', icon: 'ai' },
  { label: 'Net Worth', href: '/net-worth', icon: 'netWorth' },
  { label: 'Reports', href: '/reports', icon: 'chart' },
  { label: 'Spending Recap', href: '/recap', icon: 'sparkles' },
  { label: 'Categories', href: '/categories', icon: 'category' },
  { label: 'Loans & Debts', href: '/loan', icon: 'wallet' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'bell' },
  { label: 'SMS Auto-Tracking', href: '/settings/auto-tracking', icon: 'receipt' },
];

export const PROFILE_ACCOUNT_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Accounts', href: '/accounts', icon: 'wallet' },
  { label: 'Investments', href: '/investments', icon: 'chart' },
  { label: 'Family Groups', href: '/family', icon: 'family' },
  { label: 'Paste & import', href: '/integrations', icon: 'link' },
  { label: 'Notifications', href: '/notifications', icon: 'bell' },
  { label: 'Devices', href: '/devices', icon: 'devices' },
  { label: 'Support', href: '/support', icon: 'support' },
  { label: 'Privacy Policy', href: '/legal/privacy', icon: 'document' },
  { label: 'Terms of Service', href: '/legal/terms', icon: 'document' },
];
