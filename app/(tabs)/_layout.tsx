import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { COLORS } from '@/src/constants/config';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
        },
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.bar.fill', android: 'home', web: 'home' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'creditcard.fill', android: 'payment', web: 'payment' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'target', android: 'flag', web: 'flag' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="net-worth"
        options={{
          title: 'Net Worth',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }} tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
