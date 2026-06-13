import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';
import { appHref } from '@/src/utils/navigation';

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
  const { isTablet, horizontalPadding } = useResponsive();
  const styles = useMemo(() => createStyles(theme, isTablet), [theme, isTablet]);

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + 16, paddingHorizontal: horizontalPadding }]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.avatarText}>{name[0]?.toUpperCase() ?? '?'}</Text>
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Net savings · this period</Text>
        <Text style={styles.balanceAmount}>{netSavings}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.balanceCurrency}>{currency}</Text>
          {savingsRate !== undefined && (
            <View style={styles.ratePill}>
              <AppIcon name="chart" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.rateText}>{savingsRate}% saved</Text>
            </View>
          )}
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
              pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
            ]}
          >
            <AppIcon
              name={action.icon}
              size={18}
              color={action.primary ? theme.colors.primary : 'rgba(255,255,255,0.95)'}
            />
            <Text style={[styles.actionLabel, action.primary && styles.actionLabelPrimary]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </LinearGradient>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function createStyles(t: ReturnType<typeof useTheme>, isTablet: boolean) {
  return StyleSheet.create({
    hero: {
      paddingBottom: isTablet ? 32 : 24,
      borderBottomLeftRadius: t.radii.xl,
      borderBottomRightRadius: t.radii.xl,
      marginBottom: t.spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: t.spacing.lg,
    },
    greeting: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '500' },
    name: { color: '#fff', fontSize: isTablet ? 30 : 26, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
    avatarBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    balanceCard: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: t.radii.lg,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      marginBottom: t.spacing.lg,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' },
    balanceAmount: {
      color: '#fff',
      fontSize: isTablet ? 40 : 34,
      fontWeight: '800',
      letterSpacing: -1,
      marginTop: 4,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    balanceCurrency: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600' },
    ratePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: t.radii.full,
    },
    rateText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: t.spacing.sm },
    actionBtn: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: t.spacing.md,
      borderRadius: t.radii.md,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    actionPrimary: { backgroundColor: '#fff' },
    actionLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
    actionLabelPrimary: { color: t.colors.primary },
  });
}
