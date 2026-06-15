import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

/** Inline form / API error — matches auth banner styling. */
export function FormErrorBanner({ message }: { message: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <AppIcon name="bell" size={20} color={theme.colors.danger} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      backgroundColor: t.colors.dangerSoft,
      borderRadius: t.radii.lg,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.danger + '33',
      marginTop: t.spacing.md,
      marginBottom: t.spacing.lg,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.danger + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: { ...t.typography.bodyMedium, color: t.colors.text, flex: 1, lineHeight: 22 },
  });
}
