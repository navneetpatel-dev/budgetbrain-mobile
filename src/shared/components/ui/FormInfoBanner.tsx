import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { createStyles } from './FormInfoBanner.styles';

export function FormInfoBanner({
  message,
  icon = 'mail',
}: {
  message: string;
  icon?: AppIconName;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.banner} accessibilityRole="text">
      <View style={styles.iconWrap}>
        <AppIcon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
