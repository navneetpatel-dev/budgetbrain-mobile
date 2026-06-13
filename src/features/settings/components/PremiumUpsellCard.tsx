import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';

export function PremiumUpsellCard() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={() => router.push('/subscription')}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
    >
      <LinearGradient
        colors={[theme.colors.primary + '28', theme.colors.gradientEnd + '18']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.iconWrap}>
        <AppIcon name="ai" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>AI coach, advanced reports & unlimited budgets</Text>
      </View>
      <AppIcon name="chevronRight" size={18} color={theme.colors.primary} />
    </Pressable>
  );
}

function createStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
      overflow: 'hidden',
      marginBottom: t.spacing.lg,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    body: { flex: 1 },
    title: { ...t.typography.bodySemibold, color: t.colors.text },
    subtitle: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 },
  });
}
