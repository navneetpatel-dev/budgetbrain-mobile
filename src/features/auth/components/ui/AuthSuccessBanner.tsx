import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AuthSuccessBanner.styles';

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
