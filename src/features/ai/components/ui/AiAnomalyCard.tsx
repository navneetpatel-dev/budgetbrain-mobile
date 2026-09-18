import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { createStyles, createClearStyles } from './AiAnomalyCard.styles';

export function AiAnomalyCard({
  reason,
  meta,
}: {
  reason: string;
  meta: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <AppIcon name="shield" size={16} color={theme.colors.warning} />
      </View>
      <View style={styles.body}>
        <Text style={styles.reason}>{reason}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </View>
  );
}

export function AiAnomalyClear() {
  const theme = useTheme();
  const styles = useMemo(() => createClearStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <AppIcon name="checkmark" size={18} color={theme.colors.success} />
      </View>
      <View>
        <Text style={styles.title}>All clear</Text>
        <Text style={styles.subtitle}>No unusual spending detected</Text>
      </View>
    </View>
  );
}
