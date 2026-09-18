import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AuthDivider.styles';

export function AuthDivider({ label = 'or continue with' }: { label?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}
