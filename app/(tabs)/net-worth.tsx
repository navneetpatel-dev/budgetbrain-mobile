import { useMemo } from 'react';
import { StyleSheet, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/src/shared/services/api';
import { Card, SummaryCard, ScreenLoader, Screen, ResponsiveGrid } from '@/src/shared/components/ui';
import { useTheme } from '@/src/shared/theme';
import { formatCurrency } from '@/src/shared/utils/currency';

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthData>('/net-worth'),
  });

  if (isLoading) {
    return <ScreenLoader />;
  }

  const s = data?.summary;
  const currency = s?.currency ?? 'INR';

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <Card style={styles.hero}>
        <Text style={styles.heroLabel}>Net Worth</Text>
        <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {formatCurrency(s?.netWorth ?? 0, currency)}
        </Text>
      </Card>

      <ResponsiveGrid style={styles.grid}>
        <SummaryCard title="Assets" amount={formatCurrency(s?.totalAssets ?? 0, currency)} color={theme.colors.success} />
        <SummaryCard title="Liabilities" amount={formatCurrency(s?.totalLiabilities ?? 0, currency)} color={theme.colors.danger} />
        <SummaryCard title="Bank Balance" amount={formatCurrency(s?.bankBalance ?? 0, currency)} />
        <SummaryCard title="Investments" amount={formatCurrency(s?.investmentValue ?? 0, currency)} color={theme.colors.primary} />
      </ResponsiveGrid>

      <Text style={styles.sectionTitle}>Accounts</Text>
      {data?.accounts?.length ? (
        data.accounts.map((acc) => (
          <Card key={acc.id} style={styles.item}>
            <Text style={styles.itemName}>{acc.name}</Text>
            <Text style={styles.itemMeta}>{acc.type.replace('_', ' ')} · {acc.institution ?? '—'}</Text>
            <Text style={[styles.itemAmount, acc.type === 'credit_card' && styles.debt]}>
              {formatCurrency(Number(acc.balance), currency)}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>Add bank or credit card accounts to track net worth</Text>
      )}

      <Text style={styles.sectionTitle}>Investments</Text>
      {data?.investments?.length ? (
        data.investments.map((inv) => (
          <Card key={inv.id} style={styles.item}>
            <Text style={styles.itemName}>{inv.name}</Text>
            <Text style={styles.itemMeta}>{inv.type.replace('_', ' ')}</Text>
            <Text style={styles.itemAmount}>{formatCurrency(inv.currentValue, currency)}</Text>
            <Text style={[styles.gainLoss, inv.gainLoss >= 0 ? styles.gain : styles.loss]}>
              {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss, currency)}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>No investments tracked yet</Text>
      )}
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    hero: { alignItems: 'center', paddingVertical: 24 },
    heroLabel: { ...t.typography.caption, color: t.colors.textSecondary },
    heroValue: { ...t.typography.amountLg, color: t.colors.primary, marginTop: 4, textAlign: 'center' },
    grid: { marginBottom: 16 },
    sectionTitle: { ...t.typography.title, fontSize: 18, color: t.colors.text, marginBottom: 12, marginTop: 8 },
    item: { marginBottom: 10 },
    itemName: { ...t.typography.titleSm, color: t.colors.text },
    itemMeta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { ...t.typography.amount, color: t.colors.text, marginTop: 6 },
    debt: { color: t.colors.danger },
    gainLoss: { ...t.typography.caption, marginTop: 4, fontWeight: '600' },
    gain: { color: t.colors.success },
    loss: { color: t.colors.danger },
    empty: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginBottom: 16 },
  });
}
