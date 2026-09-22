import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { createStyles } from './FormErrorBanner.styles';

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
