import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

type IconName = SymbolViewProps['name'];

const ICONS = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  activity: { ios: 'list.bullet.rectangle.fill', android: 'receipt_long', web: 'receipt_long' },
  budgets: { ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' },
  goals: { ios: 'flag.fill', android: 'flag', web: 'flag' },
  profile: { ios: 'person.crop.circle.fill', android: 'person', web: 'person' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  income: { ios: 'arrow.down.circle.fill', android: 'south', web: 'south' },
  expense: { ios: 'arrow.up.circle.fill', android: 'north', web: 'north' },
  ai: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  netWorth: { ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  wallet: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
  shield: { ios: 'lock.shield.fill', android: 'shield', web: 'shield' },
  bell: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  support: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  family: { ios: 'person.2.fill', android: 'group', web: 'group' },
  link: { ios: 'link', android: 'link', web: 'link' },
  document: { ios: 'doc.text.fill', android: 'description', web: 'description' },
  category: { ios: 'square.grid.2x2.fill', android: 'category', web: 'category' },
  sun: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
  moon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  auto: { ios: 'circle.lefthalf.filled', android: 'brightness_auto', web: 'brightness_auto' },
} as const satisfies Record<string, IconName>;

export type AppIconName = keyof typeof ICONS;

export function AppIcon({
  name,
  size = 22,
  color,
  style,
}: {
  name: AppIconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SymbolView
      name={ICONS[name]}
      tintColor={color}
      size={size}
      style={style}
      {...(Platform.OS === 'android' ? { weight: 'medium' as const } : {})}
    />
  );
}
