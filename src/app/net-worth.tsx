import { useMemo } from 'react';
import { StyleSheet, Text, RefreshControl, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import {
  SummaryCard,
  NetWorthSkeleton,
  StickyHeaderScreen,
  GroupedCard,
  ListRow,
  ResponsiveGrid,
  EmptyState,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';

interface NetWorthData {
  summary: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    bankBalance: number;
    creditCardDebt: number;
    investmentValue: number;
    currency: string;
  };
  accounts: Array<{ id: string; name: string; type: string; balance: number; institution: string | null }>;
  investments: Array<{ id: string; name: string; type: string; currentValue: number; gainLoss: number }>;
}

export default function NetWorthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthData>('/net-worth'),
  });

  const s = data?.summary;
  const currency = s?.currency ?? 'INR';
  const accounts = data?.accounts ?? [];
  const investments = data?.investments ?? [];
  const isEmpty = !isLoading && accounts.length === 0 && investments.length === 0;

  return (
    <StickyHeaderScreen
      inset="stack"
      header={
        <ProfileStackHeader
          screen="net-worth"
          subtitle={
            isLoading
              ? 'Loading…'
              : `${accounts.length} account${accounts.length !== 1 ? 's' : ''} · ${investments.length} investment${investments.length !== 1 ? 's' : ''}`
          }
        />
      }
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {isLoading || !data || !s ? (
        <NetWorthSkeleton />
      ) : (
        <>
          <View style={styles.heroWrap}>
            <LinearGradient
              colors={[theme.colors.primary + '28', theme.colors.gradientEnd + '18']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.heroLabel}>Total net worth</Text>
            <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {formatCurrency(s.netWorth, currency)}
            </Text>
            <Text style={styles.heroCurrency}>{currency}</Text>
          </View>

          <ResponsiveGrid>
            <SummaryCard title="Assets" amount={formatCurrency(s.totalAssets, currency)} color={theme.colors.success} icon="income" />
            <SummaryCard title="Liabilities" amount={formatCurrency(s.totalLiabilities, currency)} color={theme.colors.danger} icon="expense" />
            <SummaryCard
              title="Bank Balance"
              amount={formatCurrency(s.bankBalance, currency)}
              icon="wallet"
              onPress={() => router.push('/accounts')}
            />
            <SummaryCard
              title="Investments"
              amount={formatCurrency(s.investmentValue, currency)}
              color={theme.colors.primary}
              icon="chart"
              onPress={() => router.push('/investments')}
            />
          </ResponsiveGrid>

          {isEmpty ? (
            <EmptyState
              icon="netWorth"
              title="Nothing tracked yet"
              subtitle="Add accounts and investments to see your full net worth picture"
              action="Add account"
              onAction={() => router.push('/accounts')}
              secondaryAction="View investments"
              onSecondaryAction={() => router.push('/investments')}
            />
          ) : (
            <>
              <GroupedCard title="Accounts">
                {accounts.length ? (
                  accounts.map((acc, i) => (
                    <ListRow
                      key={acc.id}
                      label={acc.name}
                      subtitle={`${acc.type.replace('_', ' ')} · ${acc.institution ?? '—'}`}
                      value={formatCurrency(Number(acc.balance), currency)}
                      onPress={() => router.push('/accounts')}
                      isLast={i === accounts.length - 1}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="wallet"
                    title="No accounts yet"
                    subtitle="Add bank accounts and credit cards to track net worth"
                    action="Manage accounts"
                    onAction={() => router.push('/accounts')}
                  />
                )}
              </GroupedCard>

              <GroupedCard title="Investments">
                {investments.length ? (
                  investments.map((inv, i) => (
                    <ListRow
                      key={inv.id}
                      label={inv.name}
                      subtitle={`${inv.type.replace('_', ' ')} · ${inv.gainLoss >= 0 ? '+' : ''}${formatCurrency(inv.gainLoss, currency)}`}
                      value={formatCurrency(inv.currentValue, currency)}
                      onPress={() => router.push('/investments')}
                      isLast={i === investments.length - 1}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="chart"
                    title="No investments yet"
                    subtitle="Track stocks, mutual funds, and more"
                    action="Manage investments"
                    onAction={() => router.push('/investments')}
                  />
                )}
              </GroupedCard>
            </>
          )}
        </>
      )}
    </StickyHeaderScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    heroWrap: {
      alignItems: 'center',
      paddingVertical: t.spacing.lg,
      paddingHorizontal: t.spacing.lg,
      borderRadius: t.radii.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    heroLabel: {
      ...t.typography.label,
      color: t.colors.textSecondary,
    },
    heroValue: {
      ...t.typography.amountLg,
      color: t.colors.text,
      marginTop: 6,
      textAlign: 'center',
    },
    heroCurrency: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: 4,
      fontWeight: '600',
    },
  });
}
