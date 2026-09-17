import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { useCountUp } from '@/shared/hooks/useCountUp';
import { formatCurrency } from '@/shared/utils/currency';
import { appHref } from '@/shared/utils/navigation';
import { SkeletonBlock } from '@/shared/components/ui/skeleton';

type QuickAction = { label: string; icon: AppIconName; href: string };

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Expense', icon: 'expense', href: '/expense/add' },
  { label: 'Income', icon: 'income', href: '/income/add' },
];

export function DashboardHero({
  name,
  amount,
  currency,
  savingsRate,
  loading = false,
}: {
  name: string;
  amount: number;
  currency: string;
  savingsRate?: number;
  loading?: boolean;
}) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tabBarPaddingX, inlineGap } = useResponsive();
  const reducedMotion = useReducedMotion();
  const animatedAmount = useCountUp(amount);
  const styles = useMemo(() => createStyles(theme, inlineGap), [theme, inlineGap]);
  const initial = name[0]?.toUpperCase() ?? '?';
  const fade = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [fade, reducedMotion, amount]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingHorizontal: tabBarPaddingX }]}>
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

      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.eyebrow}>Good {getGreeting()}</Text>
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </Pressable>
      </View>

      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.balanceLabel}>Net savings</Text>
        {loading ? (
          <View style={styles.balanceSkeletonWrap}>
            <SkeletonBlock width={148} height={34} radius={10} tone="onBrand" />
            <SkeletonBlock width={36} height={14} radius={6} tone="onBrand" style={{ marginBottom: 4 }} />
          </View>
        ) : (
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount} numberOfLines={1}>
              {formatCurrency(animatedAmount, currency)}
            </Text>
            <Text style={styles.balanceCurrency}>{currency}</Text>
          </View>
        )}
        {!loading && savingsRate !== undefined ? (
          <Text style={styles.rateText}>{Math.round(savingsRate)}% saved this month</Text>
        ) : loading ? (
          <SkeletonBlock width={140} height={12} radius={6} tone="onBrand" style={{ marginTop: 8, marginBottom: theme.spacing.md }} />
        ) : null}
      </Animated.View>

      <View style={styles.actions}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(appHref(action.href))}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <AppIcon name={action.icon} size={15} color="rgba(255,255,255,0.95)" />
            <Text style={styles.actionLabel} numberOfLines={1}>
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
      paddingBottom: t.spacing.lg,
      overflow: 'hidden',
      borderBottomLeftRadius: t.radii.xl,
      borderBottomRightRadius: t.radii.xl,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.md,
    },
    greetingBlock: { flex: 1, minWidth: 0, paddingRight: t.spacing.sm },
    eyebrow: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
      color: 'rgba(255,255,255,0.7)',
      textTransform: 'capitalize',
    },
    name: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
      marginTop: 2,
      fontFamily: 'Inter_800ExtraBold',
    },
    avatarRing: { borderRadius: 999 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
    },
    avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    balanceLabel: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
      marginBottom: 4,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: t.spacing.sm,
    },
    balanceSkeletonWrap: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: t.spacing.sm,
      minHeight: 40,
    },
    balanceAmount: {
      color: '#fff',
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: -1,
      flexShrink: 1,
      fontFamily: 'Fraunces_700Bold',
      fontVariant: ['tabular-nums'],
    },
    balanceCurrency: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: 12,
      fontWeight: '700',
    },
    rateText: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
      marginBottom: t.spacing.md,
    },
    actions: { flexDirection: 'row', gap: inlineGap, marginTop: t.spacing.sm },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 11,
      borderRadius: t.radii.md,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
    },
    actionLabel: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
