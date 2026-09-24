import React, { useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './TemplateLearningRow.styles';

export interface TemplateLearningRowProps {
  value: boolean;
  disabled: boolean;
  onToggle: (value: boolean) => void;
}

/** Opt-in to sharing masked message shapes (plan T7.4, D-5). Off by default. */
export function TemplateLearningRow({ value, disabled, onToggle }: TemplateLearningRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Help Improve Detection</Text>
        <Text style={styles.subtitle}>
          Share the layout of bank messages we could not read, with every amount, date, account,
          name and number removed. Never the message itself.
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onToggle}
        accessibilityLabel="Help improve detection"
        trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.onPrimary : theme.colors.surface}
      />
    </View>
  );
}
