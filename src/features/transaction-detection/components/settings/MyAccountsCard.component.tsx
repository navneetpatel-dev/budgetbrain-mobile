import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Button, Input } from '@/shared/components/ui';
import { OwnEntryChip } from './OwnEntryChip.component';
import { createStyles } from './MyAccountsCard.styles';

export interface MyAccountsCardProps {
  ownAccountTails: string[];
  linkedAccountTails: string[];
  ownVpas: string[];
  tailDraft: string;
  vpaDraft: string;
  error: string | null;
  onChangeTail: (value: string) => void;
  onChangeVpa: (value: string) => void;
  onSubmitTail: () => void;
  onSubmitVpa: () => void;
  onRemoveTail: (tail: string) => void;
  onRemoveVpa: (vpa: string) => void;
}

/**
 * "My accounts" (plan T5.7): money moving between two of these is recorded as a transfer, not as
 * spending. The rows below are capped at MAX_OWN_ENTRIES in the slice, so they are fixed chip rows.
 */
export function MyAccountsCard(props: MyAccountsCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hasTails = props.linkedAccountTails.length > 0 || props.ownAccountTails.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.description}>
        Add the last digits of your own accounts and cards, and your UPI IDs. Money moving between them is a
        transfer, not spending.
      </Text>

      {hasTails ? (
        <View style={styles.chipRow}>
          {/* Short, capped list (see above). */}
          {props.linkedAccountTails.map((tail) => (
            <OwnEntryChip key={`linked:${tail}`} label={`••• ${tail} · linked`} value={tail} />
          ))}
          {props.ownAccountTails.map((tail) => (
            <OwnEntryChip key={tail} label={`••• ${tail}`} value={tail} onRemove={props.onRemoveTail} />
          ))}
        </View>
      ) : null}
      <View style={styles.inputRow}>
        <View style={styles.inputFlex}>
          <Input
            label="Account or card number"
            value={props.tailDraft}
            onChangeText={props.onChangeTail}
            placeholder="Last 4 digits"
            keyboardType="number-pad"
            maxLength={4}
            onSubmitEditing={props.onSubmitTail}
          />
        </View>
        <View style={styles.addButton}>
          <Button title="Add" variant="outline" onPress={props.onSubmitTail} />
        </View>
      </View>

      {props.ownVpas.length > 0 ? (
        <View style={styles.chipRow}>
          {/* Short, capped list (see above). */}
          {props.ownVpas.map((vpa) => (
            <OwnEntryChip key={vpa} label={vpa} value={vpa} onRemove={props.onRemoveVpa} />
          ))}
        </View>
      ) : null}
      <View style={styles.inputRow}>
        <View style={styles.inputFlex}>
          <Input
            label="UPI ID"
            value={props.vpaDraft}
            onChangeText={props.onChangeVpa}
            placeholder="name@okhdfc"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={props.onSubmitVpa}
          />
        </View>
        <View style={styles.addButton}>
          <Button title="Add" variant="outline" onPress={props.onSubmitVpa} />
        </View>
      </View>

      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
    </View>
  );
}
