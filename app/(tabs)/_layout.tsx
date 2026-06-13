import { Tabs } from 'expo-router';
import { CustomTabBar, type CustomTabBarProps } from '@/src/components/CustomTabBar';
import { useTheme } from '@/src/theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar
          state={props.state}
          navigation={props.navigation as CustomTabBarProps['navigation']}
        />
      )}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="expenses" options={{ title: 'Activity', headerShown: false }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budgets', headerShown: false }} />
      <Tabs.Screen name="settings" options={{ title: 'Profile', headerShown: false }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="income" options={{ href: null }} />
      <Tabs.Screen name="ai" options={{ href: null }} />
      <Tabs.Screen name="net-worth" options={{ href: null }} />
    </Tabs>
  );
}
