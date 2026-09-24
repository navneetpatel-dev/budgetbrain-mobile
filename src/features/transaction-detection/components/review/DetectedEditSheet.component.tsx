import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Button, FormFieldLabel, FormModal, Input, OptionChipList, OptionChips } from '@/shared/components/ui';
import type { ConfirmPayload } from '../../api/detectedTransactions.api';
import type { DetectedTransactionDto } from '../../types/transactionDetection.types';
import { useDetectedEditForm } from '../../hooks/useDetectedEditForm.hook';
import { createStyles } from './DetectedEditSheet.styles';

export interface DetectedEditSheetProps {
  item: DetectedTransactionDto | null;
  saving: boolean;
  onSave: (item: DetectedTransactionDto, overrides: ConfirmPayload) => void;
  onClose: () => void;
}

const TYPE_LABEL: Record<DetectedTransactionDto['transactionType'], string> = {
  expense: 'Expense',
  income: 'Income',
  refund: 'Refund',
  transfer: 'Transfer',
};

/** Edit a detected transaction before adding it (plan T5.1): merchant, type, category, account, note. */
export function DetectedEditSheet({ item, saving, onSave, onClose }: DetectedEditSheetProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const form = useDetectedEditForm(item);
  const handleSave = () => {
    if (item) onSave(item, form.overrides());
  };

  return (
    <FormModal
      visible={item !== null}
      title="Edit before adding"
      subtitle="Changing the category or merchant teaches BudgetBrain for next time."
      onClose={onClose}
      footer={<Button title="Save and add" onPress={handleSave} loading={saving} />}
    >
      <View style={styles.body}>
        <Input label="Merchant" value={form.values.merchant} onChangeText={form.setMerchant} placeholder="Who was paid" />

        <FormFieldLabel>Type</FormFieldLabel>
        <OptionChips
          options={form.typeOptions}
          value={form.values.transactionType}
          onChange={form.setTransactionType}
          getLabel={(value) => TYPE_LABEL[value]}
        />

        {form.showCategory ? (
          <>
            <FormFieldLabel>Category</FormFieldLabel>
            <OptionChipList items={form.categoryItems} selectedId={form.values.categoryId} onSelect={form.setCategoryId} />
          </>
        ) : null}

        <FormFieldLabel>Account</FormFieldLabel>
        <OptionChipList items={form.accountItems} selectedId={form.values.financialAccountId} onSelect={form.setFinancialAccountId} />

        <Input label="Note" value={form.values.notes} onChangeText={form.setNotes} placeholder="Optional" multiline />
      </View>
    </FormModal>
  );
}
