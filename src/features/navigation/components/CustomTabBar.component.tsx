import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { ActionSheet } from '@/shared/components/ui/ActionSheet.component';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { appHref } from '@/shared/utils/navigation';
import { createStyles } from './CustomTabBar.styles';

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
      <View style={styles.iconIdle}>
        <AppIcon
          name={config.icon}
          size={22}
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
        />
      </View>
      <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
        {config.label}
      </Text>
      <View style={[styles.indicator, isFocused && { backgroundColor: theme.colors.primary }]} />
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const theme = useTheme();
  const bottomSafe = useBottomSafeInset();
  const router = useRouter();
  const { tabBarBottomInset, tabBarPaddingX } = useResponsive();
  const styles = useMemo(() => createStyles(theme, tabBarPaddingX), [theme, tabBarPaddingX]);
  const [sheetOpen, setSheetOpen] = useState(false);

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
    <>
      <View style={[styles.outer, { paddingBottom: Math.max(bottomSafe, tabBarBottomInset) }]}>
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
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
            accessibilityRole="button"
            accessibilityLabel="Create"
          >
            <LinearGradient
              colors={[theme.colors.ocean, theme.colors.primary, theme.colors.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <AppIcon name="add" size={26} color="#FFFFFF" />
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

      <ActionSheet
        visible={sheetOpen}
        title="Create"
        onClose={() => setSheetOpen(false)}
        items={[
          {
            id: 'expense',
            label: 'Expense',
            subtitle: 'Log a purchase or bill',
            icon: 'expense',
            onPress: () => router.push(appHref('/expense/add')),
          },
          {
            id: 'income',
            label: 'Income',
            subtitle: 'Record money in',
            icon: 'income',
            onPress: () => router.push(appHref('/income/add')),
          },
          {
            id: 'budget',
            label: 'Budget',
            subtitle: 'Set a spending limit',
            icon: 'budgets',
            onPress: () => router.push(appHref('/budget/add')),
          },
          {
            id: 'goal',
            label: 'Goal',
            subtitle: 'Start a savings target',
            icon: 'goals',
            onPress: () => router.push(appHref('/goal/add')),
          },
        ]}
      />
    </>
  );
}
