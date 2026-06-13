import { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/src/services/api';
import { Card, SummaryCard, ScreenLoader } from '@/src/components/ui';
import { useTheme } from '@/src/theme';

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

function format(amount: number, currency: string) {
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <Card style={styles.hero}>
        <Text style={styles.heroLabel}>Net Worth</Text>
        <Text style={styles.heroValue}>{format(s?.netWorth ?? 0, currency)}</Text>
      </Card>

      <View style={styles.grid}>
        <SummaryCard title="Assets" amount={format(s?.totalAssets ?? 0, currency)} color={theme.colors.success} />
        <SummaryCard title="Liabilities" amount={format(s?.totalLiabilities ?? 0, currency)} color={theme.colors.danger} />
        <SummaryCard title="Bank Balance" amount={format(s?.bankBalance ?? 0, currency)} />
        <SummaryCard title="Investments" amount={format(s?.investmentValue ?? 0, currency)} color={theme.colors.primary} />
      </View>

      <Text style={styles.sectionTitle}>Accounts</Text>
      {data?.accounts?.length ? (
        data.accounts.map((acc) => (
          <Card key={acc.id} style={styles.item}>
            <Text style={styles.itemName}>{acc.name}</Text>
            <Text style={styles.itemMeta}>{acc.type.replace('_', ' ')} · {acc.institution ?? '—'}</Text>
            <Text style={[styles.itemAmount, acc.type === 'credit_card' && styles.debt]}>
              {format(Number(acc.balance), currency)}
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
            <Text style={styles.itemAmount}>{format(inv.currentValue, currency)}</Text>
            <Text style={[styles.gainLoss, inv.gainLoss >= 0 ? styles.gain : styles.loss]}>
              {inv.gainLoss >= 0 ? '+' : ''}{format(inv.gainLoss, currency)}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>No investments tracked yet</Text>
      )}
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: 16, paddingBottom: 32 },
    hero: { alignItems: 'center', marginBottom: 16, paddingVertical: 24 },
    heroLabel: { fontSize: 14, color: t.colors.textSecondary },
    heroValue: { fontSize: 36, fontWeight: '800', color: t.colors.primary, marginTop: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: t.colors.text, marginBottom: 12, marginTop: 8 },
    item: { marginBottom: 10 },
    itemName: { fontSize: 16, fontWeight: '600', color: t.colors.text },
    itemMeta: { fontSize: 12, color: t.colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { fontSize: 18, fontWeight: '700', color: t.colors.text, marginTop: 6 },
    debt: { color: t.colors.danger },
    gainLoss: { fontSize: 13, marginTop: 4, fontWeight: '600' },
    gain: { color: t.colors.success },
    loss: { color: t.colors.danger },
    empty: { color: t.colors.textSecondary, fontSize: 14, marginBottom: 16 },
  });
}
