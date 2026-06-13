import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

export function AuthSuccessBanner({ message }: { message: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <AppIcon name="checkmark" size={22} color={theme.colors.success} />
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
      backgroundColor: t.colors.successSoft,
      borderRadius: t.radii.lg,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.success + '33',
      marginBottom: t.spacing.lg,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.success + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: { ...t.typography.bodyMedium, color: t.colors.text, flex: 1, lineHeight: 22 },
  });
}
