import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';

export interface CustomTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (route: string) => void;
  };
}

type TabConfig = {
  route: string;
  label: string;
  icon: AppIconName;
};

const TABS: TabConfig[] = [
  { route: 'index', label: 'Home', icon: 'home' },
  { route: 'expenses', label: 'Activity', icon: 'activity' },
  { route: 'budgets', label: 'Budgets', icon: 'budgets' },
  { route: 'settings', label: 'Profile', icon: 'profile' },
];

/** Full-screen tab routes that hide the floating bottom bar */
const HIDDEN_TAB_BAR_ROUTES = new Set(['ai']);

function TabButton({
  config,
  isFocused,
  onPress,
  styles,
  theme,
}: {
  config: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      {isFocused ? (
        <LinearGradient
          colors={[theme.colors.primary + '38', theme.colors.gradientEnd + '22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeCapsule}
        >
          <View style={styles.activeIconRing}>
            <AppIcon name={config.icon} size={21} color={theme.colors.primary} />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.iconIdle}>
          <AppIcon name={config.icon} size={20} color={theme.colors.textTertiary} />
        </View>
      )}

      <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
        {config.label}
      </Text>

      {isFocused ? (
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.activeIndicator}
        />
      ) : (
        <View style={styles.inactiveIndicator} />
      )}
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tabBarBottomInset, tabBarPaddingX } = useResponsive();
  const styles = useMemo(() => createStyles(theme, tabBarPaddingX), [theme, tabBarPaddingX]);

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);
  const currentRoute = state.routes[state.index]?.name;

  if (currentRoute && HIDDEN_TAB_BAR_ROUTES.has(currentRoute)) {
    return null;
  }

  const navigate = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const isFocused = state.routes[state.index]?.name === routeName;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, tabBarBottomInset) }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {leftTabs.map((tab) => (
            <TabButton
              key={tab.route}
              config={tab}
              isFocused={state.routes[state.index]?.name === tab.route}
              onPress={() => navigate(tab.route)}
              styles={styles}
              theme={theme}
            />
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/expense/add')}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <AppIcon name="add" size={28} color={theme.colors.onPrimary} />
          </LinearGradient>
        </Pressable>

        <View style={styles.side}>
          {rightTabs.map((tab) => (
            <TabButton
              key={tab.route}
              config={tab}
              isFocused={state.routes[state.index]?.name === tab.route}
              onPress={() => navigate(tab.route)}
              styles={styles}
              theme={theme}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function createStyles(t: AppTheme, tabBarPaddingX: number) {
  return StyleSheet.create({
    outer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: tabBarPaddingX,
      paddingTop: t.spacing.xs,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: t.isDark ? 'rgba(22, 29, 50, 0.92)' : t.colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      paddingHorizontal: t.spacing.sm,
      paddingTop: t.spacing.sm,
      paddingBottom: t.spacing.sm,
      minHeight: 64,
      ...t.shadows.lg,
      ...Platform.select({ android: { elevation: 12 } }),
    },
    side: {
      flex: 1,
      flexDirection: 'row',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      gap: 3,
      minHeight: 52,
    },
    tabPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
    activeCapsule: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.colors.primary + '44',
    },
    activeIconRing: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconIdle: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 10,
      fontWeight: '600',
      color: t.colors.textTertiary,
      letterSpacing: 0.2,
    },
    labelActive: {
      color: t.colors.primary,
      fontWeight: '700',
    },
    activeIndicator: {
      width: 18,
      height: 3,
      borderRadius: 2,
      marginTop: 1,
    },
    inactiveIndicator: {
      width: 18,
      height: 3,
      marginTop: 1,
      opacity: 0,
    },
    fab: {
      marginTop: -28,
      marginHorizontal: t.spacing.xs,
      borderRadius: 28,
      ...t.shadows.lg,
      borderWidth: 4,
      borderColor: t.colors.background,
    },
    fabGradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
