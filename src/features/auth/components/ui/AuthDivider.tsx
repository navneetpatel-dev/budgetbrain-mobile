import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';

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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: t.spacing.lg,
      gap: t.spacing.md,
    },
    line: { flex: 1, height: 1, backgroundColor: t.colors.border },
    label: { ...t.typography.caption, color: t.colors.textTertiary },
  });
}
