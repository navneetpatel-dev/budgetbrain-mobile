import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './OwnEntryChip.styles';

export interface OwnEntryChipProps {
  label: string;
  value: string;
  /** Linked accounts come from the accounts list and can't be removed here. */
  onRemove?: (value: string) => void;
}

export function OwnEntryChip({ label, value, onRemove }: OwnEntryChipProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleRemove = () => onRemove?.(value);

  return (
    <View style={[styles.chip, !onRemove && styles.chipLinked]}>
      <Text style={styles.label}>{label}</Text>
      {onRemove ? (
        <TouchableOpacity
          onPress={handleRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
        >
          <Text style={styles.remove}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
