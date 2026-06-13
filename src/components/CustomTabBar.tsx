import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';

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
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <View style={[styles.iconPill, isFocused && { backgroundColor: theme.colors.primarySoft }]}>
        <AppIcon
          name={config.icon}
          size={isFocused ? 22 : 20}
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
        />
      </View>
      <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
        {config.label}
      </Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isTablet, tabBarBottomInset } = useResponsive();
  const styles = useMemo(() => createStyles(theme, isTablet), [theme, isTablet]);

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

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
          <AppIcon name="add" size={28} color={theme.colors.onPrimary} />
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

function createStyles(t: ReturnType<typeof useTheme>, isTablet: boolean) {
  return StyleSheet.create({
    outer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: isTablet ? 64 : 20,
      paddingTop: 8,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: t.colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      paddingHorizontal: 6,
      paddingTop: 8,
      paddingBottom: 8,
      minHeight: 68,
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
      paddingVertical: 4,
    },
    tabPressed: { opacity: 0.85 },
    iconPill: {
      width: 40,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 10,
      fontWeight: '600',
      color: t.colors.textTertiary,
      marginTop: 2,
    },
    labelActive: { color: t.colors.primary },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -32,
      marginHorizontal: 4,
      ...t.shadows.lg,
      borderWidth: 4,
      borderColor: t.colors.background,
    },
  });
}
