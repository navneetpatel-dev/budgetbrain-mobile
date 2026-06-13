import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { appHref } from '@/shared/utils/navigation';

type QuickAction = { label: string; icon: AppIconName; href: string; primary?: boolean };

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Expense', icon: 'expense', href: '/expense/add', primary: true },
  { label: 'Income', icon: 'income', href: '/income/add' },
  { label: 'Budget', icon: 'budgets', href: '/budget/add' },
  { label: 'AI', icon: 'ai', href: '/(tabs)/ai' },
];

export function DashboardHero({
  name,
  netSavings,
  currency,
  savingsRate,
}: {
  name: string;
  netSavings: string;
  currency: string;
  savingsRate?: number;
}) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { screenPaddingX, inlineGap } = useResponsive();
  const styles = useMemo(() => createStyles(theme, inlineGap), [theme, inlineGap]);
  const initial = name[0]?.toUpperCase() ?? '?';

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingHorizontal: screenPaddingX }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.primary, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.orb, styles.orbRight]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbLeft]} pointerEvents="none" />

      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.eyebrow}>GOOD {getGreeting().toUpperCase()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={({ pressed }) => [styles.avatarRing, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.1)']}
            style={styles.avatarRingGradient}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <Text style={styles.balanceLabel}>Net savings</Text>
          {savingsRate !== undefined && (
            <View style={styles.ratePill}>
              <AppIcon name="chart" size={10} color="rgba(255,255,255,0.9)" />
              <Text style={styles.rateText}>{savingsRate}% saved</Text>
            </View>
          )}
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount} numberOfLines={1}>
            {netSavings}
          </Text>
          <Text style={styles.balanceCurrency}>{currency}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(appHref(action.href))}
            style={({ pressed }) => [
              styles.actionBtn,
              action.primary && styles.actionPrimary,
              pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
          >
            <AppIcon
              name={action.icon}
              size={15}
              color={action.primary ? theme.colors.primary : 'rgba(255,255,255,0.95)'}
            />
            <Text style={[styles.actionLabel, action.primary && styles.actionLabelPrimary]} numberOfLines={1}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function createStyles(t: AppTheme, inlineGap: number) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.md,
      overflow: 'hidden',
      borderBottomLeftRadius: t.radii.xl,
      borderBottomRightRadius: t.radii.xl,
    },
    orb: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    orbRight: { width: 130, height: 130, top: -35, right: -45 },
    orbLeft: { width: 80, height: 80, bottom: 20, left: -25 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.sm,
    },
    greetingBlock: { flex: 1, minWidth: 0, paddingRight: t.spacing.sm },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      color: 'rgba(255,255,255,0.65)',
    },
    name: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
      marginTop: 2,
    },
    avatarRing: { borderRadius: 999, padding: 2 },
    avatarRingGradient: { borderRadius: 999, padding: 2 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    balanceCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: t.radii.lg,
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm + 2,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      marginBottom: t.spacing.sm,
    },
    balanceTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    balanceLabel: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: t.spacing.sm,
    },
    balanceAmount: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.8,
      flexShrink: 1,
    },
    balanceCurrency: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: 12,
      fontWeight: '700',
    },
    ratePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
    },
    rateText: { color: 'rgba(255,255,255,0.88)', fontSize: 10, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: inlineGap },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderRadius: t.radii.md,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    actionPrimary: {
      backgroundColor: '#fff',
      borderColor: 'rgba(255,255,255,0.95)',
    },
    actionLabel: {
      color: 'rgba(255,255,255,0.92)',
      fontSize: 10,
      fontWeight: '700',
    },
    actionLabelPrimary: { color: t.colors.primary },
  });
}
