import { StackNavHeader, useProfileBack } from '@/shared/components/ui';
import type { AppIconName } from '@/features/navigation/components/AppIcon.component';

export type ProfileScreenKey =
  | 'goals'
  | 'income'
  | 'ai'
  | 'net-worth'
  | 'reports'
  | 'recap'
  | 'categories'
  | 'accounts'
  | 'investments'
  | 'family'
  | 'integrations'
  | 'notifications'
  | 'support'
  | 'privacy'
  | 'terms'
  | 'loans'
  | 'subscriptions'
  | 'devices';

const PROFILE_SCREEN_TITLES: Record<ProfileScreenKey, string> = {
  goals: 'Goals',
  income: 'Income',
  ai: 'AI Coach',
  'net-worth': 'Net Worth',
  reports: 'Reports',
  recap: 'Spending Recap',
  categories: 'Categories',
  accounts: 'Accounts',
  investments: 'Investments',
  family: 'Family',
  integrations: 'Paste & import',
  notifications: 'Notifications',
  support: 'Support',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  loans: 'Loans & Debts',
  subscriptions: 'Subscriptions',
  devices: 'Devices',
};

/** Single compact header wrapper for every screen linked from Profile */
export function ProfileStackHeader({
  screen,
  subtitle,
  footer,
  actionIcon,
  onAction,
  actionLabel,
}: {
  screen: ProfileScreenKey;
  subtitle?: string;
  footer?: React.ReactNode;
  actionIcon?: AppIconName;
  onAction?: () => void;
  actionLabel?: string;
}) {
  const goBack = useProfileBack();

  return (
    <StackNavHeader
      title={PROFILE_SCREEN_TITLES[screen]}
      subtitle={subtitle}
      onBack={goBack}
      footer={footer}
      actionIcon={actionIcon}
      onAction={onAction}
      actionLabel={actionLabel}
    />
  );
}
