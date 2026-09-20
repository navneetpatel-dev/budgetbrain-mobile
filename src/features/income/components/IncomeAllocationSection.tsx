import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Button, FormFieldLabel, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { FinancialAccount } from '@/shared/types';
import { createStyles } from './IncomeAllocationSection.styles';
import { allocationSumMatches, accountsForCurrency } from '@/features/income/utils/incomeAllocation';

/**
 * Split-into-accounts action for a single income entry. Re-submitting replaces any prior
 * allocation cleanly on the backend (reverses old balance deltas, applies new ones) — there is
 * currently no endpoint to read back a prior allocation, so this section always starts fresh
 * rather than pre-filling; a `GET /income/:id/allocations` endpoint would be needed for that
 * (flagged, out of scope here).
 */
export function IncomeAllocationSection({
  transactionId,
  amount,
  currency,
}: {
  transactionId: string;
  amount: number;
  currency: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: accounts } = usePaginatedList<FinancialAccount, 'accounts'>({
    queryKey: ['accounts'],
    url: '/accounts',
    itemsKey: 'accounts',
    enabled: open,
  });
  const eligible = accountsForCurrency(accounts, currency);

  const startAllocate = () => {
    setOpen(true);
    setSuccess(false);
    setError(null);
  };

  const toggleAccount = (accountId: string, defaultShare: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[accountId] !== undefined) {
        delete next[accountId];
      } else {
        next[accountId] = String(defaultShare);
      }
      return next;
    });
  };

  const selectedIds = Object.keys(selected);
  const total = selectedIds.reduce((sum, id) => sum + (Number(selected[id]) || 0), 0);
  const matches = allocationSumMatches(selected, amount);

  const submit = async () => {
    if (!matches) return;
    setLoading(true);
    setError(null);
    try {
      await apiPost(`/income/${transactionId}/allocate`, {
        allocations: selectedIds.map((financialAccountId) => ({
          financialAccountId,
          amount: Number(selected[financialAccountId]),
        })),
      });
      setSuccess(true);
      setSelected({});
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not allocate income'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {!open ? (
        <Button title="Split into accounts" variant="outline" onPress={startAllocate} />
      ) : (
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <FormFieldLabel>Split into accounts</FormFieldLabel>
          </View>

          {error ? <FormErrorBanner message={error} /> : null}
          {success ? <FormSuccessBanner message="Income allocated to accounts" /> : null}

          {eligible.length === 0 ? (
            <Text style={styles.emptyText}>
              No {currency} accounts yet — add one from Accounts to split this income.
            </Text>
          ) : (
            <>
              {eligible.map((acc) => {
                const isSelected = selected[acc.id] !== undefined;
                const remaining = amount - total + (Number(selected[acc.id]) || 0);
                return (
                  <Pressable
                    key={acc.id}
                    style={[styles.accountRow, isSelected && styles.accountRowSelected]}
                    onPress={() => toggleAccount(acc.id, Math.max(remaining, 0))}
                  >
                    <View>
                      <Text style={styles.accountName}>{acc.name}</Text>
                      <Text style={styles.accountMeta}>
                        Balance {formatCurrency(acc.balance, acc.currency)}
                      </Text>
                    </View>
                    {isSelected ? (
                      <TextInput
                        value={selected[acc.id]}
                        onChangeText={(v) => setSelected((prev) => ({ ...prev, [acc.id]: v }))}
                        keyboardType="numeric"
                        style={styles.amountInput}
                      />
                    ) : null}
                  </Pressable>
                );
              })}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Allocated</Text>
                <Text style={[styles.totalValue, !matches && styles.totalValueMismatch]}>
                  {formatCurrency(total, currency)} / {formatCurrency(amount, currency)}
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <Button title="Save split" onPress={submit} loading={loading} disabled={!matches} size="md" />
                <Button title="Cancel" variant="outline" onPress={() => setOpen(false)} />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}
