import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: 12,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.warningSoft,
      borderWidth: 1,
      borderColor: t.colors.warning + '33',
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.warning + '22',
    },
    body: { flex: 1 },
    reason: { ...t.typography.bodyMedium, fontWeight: '600', color: t.colors.text },
    meta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
  });
}

function createClearStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.successSoft,
      borderWidth: 1,
      borderColor: t.colors.success + '33',
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.success + '22',
    },
    title: { ...t.typography.bodySemibold, color: t.colors.text },
    subtitle: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 },
  });
}
