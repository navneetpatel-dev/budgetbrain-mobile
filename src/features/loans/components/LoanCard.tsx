import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Card, ProgressBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { Loan } from '@/shared/types';

export function LoanCard({ loan, onDelete }: { loan: Loan; onDelete: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const paidOff = Number(loan.principal) - Number(loan.remainingBalance);
  const progress = toSafePercent(paidOff, loan.principal);
  const openLoan = () => router.push(appHref(`/loan/${loan.id}`));

  return (
    <Card style={styles.card}>
      <Pressable onPress={openLoan}>
        <View style={styles.header}>
          <View style={styles.titleCol}>
            <Text style={styles.name}>{loan.name}</Text>
            <Text style={styles.type}>{loan.type.replace('_', ' ')}{loan.closed ? ' · paid off' : ''}</Text>
          </View>
          <Pressable onPress={onDelete} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Delete ${loan.name}`}>
            <AppIcon name="trash" size={18} color={theme.colors.danger} />
          </Pressable>
        </View>
        <Text style={styles.remaining}>{formatCurrency(Number(loan.remainingBalance), loan.currency)}</Text>
        <Text style={styles.principal}>remaining of {formatCurrency(Number(loan.principal), loan.currency)}</Text>
        <ProgressBar progress={progress} color={loan.closed ? theme.colors.success : theme.colors.primary} style={{ marginTop: 10 }} />
      </Pressable>
    </Card>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginBottom: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleCol: { flex: 1 },
    name: { ...t.typography.titleSm, color: t.colors.text },
    type: { ...t.typography.caption, color: t.colors.textTertiary, textTransform: 'capitalize', marginTop: 2 },
    remaining: { ...t.typography.amount, color: t.colors.text },
    principal: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
  });
}
