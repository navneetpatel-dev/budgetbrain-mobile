import { useMemo } from 'react';
import { StyleSheet, Text, RefreshControl, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import {
  Card,
  SummaryCard,
  NetWorthSkeleton,
  StickyHeaderScreen,
  GroupedCard,
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

  if (isLoading) {
    return <NetWorthSkeleton />;
  }

  const s = data?.summary;
  const currency = s?.currency ?? 'INR';
  const accounts = data?.accounts ?? [];
  const investments = data?.investments ?? [];

  return (
    <StickyHeaderScreen
      inset="stack"
      header={
        <ProfileStackHeader
          screen="net-worth"
          subtitle={`${accounts.length} account${accounts.length !== 1 ? 's' : ''} · ${investments.length} investment${investments.length !== 1 ? 's' : ''}`}
        />
      }
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[theme.colors.primary + '28', theme.colors.gradientEnd + '18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.heroLabel}>TOTAL NET WORTH</Text>
        <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {formatCurrency(s?.netWorth ?? 0, currency)}
        </Text>
        <Text style={styles.heroCurrency}>{currency}</Text>
      </View>

      <ResponsiveGrid>
        <SummaryCard title="Assets" amount={formatCurrency(s?.totalAssets ?? 0, currency)} color={theme.colors.success} icon="income" />
        <SummaryCard title="Liabilities" amount={formatCurrency(s?.totalLiabilities ?? 0, currency)} color={theme.colors.danger} icon="expense" />
        <SummaryCard
          title="Bank Balance"
          amount={formatCurrency(s?.bankBalance ?? 0, currency)}
          icon="wallet"
          onPress={() => router.push('/accounts')}
        />
        <SummaryCard
          title="Investments"
          amount={formatCurrency(s?.investmentValue ?? 0, currency)}
          color={theme.colors.primary}
          icon="chart"
          onPress={() => router.push('/investments')}
        />
      </ResponsiveGrid>

      <GroupedCard title="Accounts" padded>
        {accounts.length ? (
          accounts.map((acc) => (
            <Pressable key={acc.id} onPress={() => router.push('/accounts')}>
              <Card style={styles.item}>
                <Text style={styles.itemName}>{acc.name}</Text>
                <Text style={styles.itemMeta}>{acc.type.replace('_', ' ')} · {acc.institution ?? '—'}</Text>
                <Text style={[styles.itemAmount, acc.type === 'credit_card' && styles.debt]}>
                  {formatCurrency(Number(acc.balance), currency)}
                </Text>
              </Card>
            </Pressable>
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

      <GroupedCard title="Investments" padded>
        {investments.length ? (
          investments.map((inv) => (
            <Pressable key={inv.id} onPress={() => router.push('/investments')}>
              <Card style={styles.item}>
                <Text style={styles.itemName}>{inv.name}</Text>
                <Text style={styles.itemMeta}>{inv.type.replace('_', ' ')}</Text>
                <Text style={styles.itemAmount}>{formatCurrency(inv.currentValue, currency)}</Text>
                <Text style={[styles.gainLoss, inv.gainLoss >= 0 ? styles.gain : styles.loss]}>
                  {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss, currency)}
                </Text>
              </Card>
            </Pressable>
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
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
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
    item: { marginBottom: 0 },
    itemName: { ...t.typography.titleSm, color: t.colors.text },
    itemMeta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { ...t.typography.amount, color: t.colors.text, marginTop: 6 },
    debt: { color: t.colors.danger },
    gainLoss: { ...t.typography.caption, marginTop: 4, fontWeight: '600' },
    gain: { color: t.colors.success },
    loss: { color: t.colors.danger },
  });
}
