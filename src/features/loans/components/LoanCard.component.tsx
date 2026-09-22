import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Card, ProgressBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import type { Loan } from '@/shared/types';
import { createStyles } from './LoanCard.styles';

export const LoanCard = memo(function LoanCard({
  loan,
  onDelete,
}: {
  loan: Loan;
  /** Takes the loan id (not a pre-bound callback) so the parent list can pass one stable
   * function reference for every row instead of a fresh closure per row. */
  onDelete: (id: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const cardSpring = useSpringPress(0.98);
  const deleteSpring = useSpringPress();
  // Server-computed — never derive from principal/remainingBalance client-side.
  const progress = loan.paidPercentage ?? 0;
  const openLoan = () => router.push(appHref(`/loan/${loan.id}`));

  return (
    <Card style={styles.card}>
      <Pressable onPress={openLoan} onPressIn={cardSpring.onPressIn} onPressOut={cardSpring.onPressOut}>
        <Animated.View style={cardSpring.style}>
          <View style={styles.header}>
            <View style={styles.titleCol}>
              <Text style={styles.name}>{loan.name}</Text>
              <Text style={styles.type}>{loan.type.replace('_', ' ')}{loan.closed ? ' · paid off' : ''}</Text>
            </View>
            <Pressable
              onPress={() => showConfirmation(CONFIRM.deleteLoan, () => onDelete(loan.id))}
              onPressIn={deleteSpring.onPressIn}
              onPressOut={deleteSpring.onPressOut}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${loan.name}`}
            >
              <Animated.View style={deleteSpring.style}>
                <AppIcon name="trash" size={18} color={theme.colors.danger} />
              </Animated.View>
            </Pressable>
          </View>
          <Text style={styles.remaining}>{formatCurrency(Number(loan.remainingBalance), loan.currency)}</Text>
          <Text style={styles.principal}>remaining of {formatCurrency(Number(loan.principal), loan.currency)}</Text>
          <ProgressBar progress={progress} color={loan.closed ? theme.colors.success : theme.colors.primary} style={{ marginTop: 10 }} />
        </Animated.View>
      </Pressable>
    </Card>
  );
});
