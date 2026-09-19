import { SymbolView } from 'expo-symbols';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/shared/theme';

export type AppIconSize = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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
  send: { ios: 'paperplane.fill', android: 'send', web: 'send' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  target: { ios: 'scope', android: 'track_changes', web: 'track_changes' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  wallet: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
  shield: { ios: 'lock.shield.fill', android: 'shield', web: 'shield' },
  bell: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  support: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  family: { ios: 'person.2.fill', android: 'group', web: 'group' },
  link: { ios: 'link', android: 'link', web: 'link' },
  document: { ios: 'doc.text.fill', android: 'description', web: 'description' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  category: { ios: 'square.grid.2x2.fill', android: 'category', web: 'category' },
  filter: { ios: 'line.3.horizontal.decrease.circle', android: 'filter_list', web: 'filter_list' },
  more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  sun: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
  moon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
  auto: { ios: 'circle.lefthalf.filled', android: 'brightness_auto', web: 'brightness_auto' },
  trash: { ios: 'trash.fill', android: 'delete', web: 'delete' },
  mail: { ios: 'envelope.fill', android: 'mail', web: 'mail' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  key: { ios: 'key.fill', android: 'key', web: 'key' },
  personFill: { ios: 'person.fill', android: 'person', web: 'person' },
  checkmark: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  arrowLeft: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  arrowUp: { ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'keyboard_arrow_up' },
  arrowDown: { ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' },
  edit: { ios: 'square.and.pencil', android: 'edit_note', web: 'edit_note' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  apple: { ios: 'apple.logo', android: 'phone_iphone', web: 'phone_iphone' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeSlash: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  trendingUp: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  reports: { ios: 'doc.text.fill', android: 'assessment', web: 'assessment' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  devices: { ios: 'iphone', android: 'devices', web: 'devices' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  receipt: { ios: 'doc.text.fill', android: 'receipt', web: 'receipt' },
  dragHandle: { ios: 'line.3.horizontal', android: 'drag_indicator', web: 'drag_indicator' },
} as const;

export type AppIconName = keyof typeof ICONS;

export function AppIcon({
  name,
  size = 22,
  color,
  style,
}: {
  name: AppIconName;
  size?: AppIconSize;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const resolvedSize = typeof size === 'number' ? size : theme.iconSizes[size];

  return (
    <View
      style={[
        { width: resolvedSize, height: resolvedSize, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <SymbolView
        name={{
          ios: ICONS[name].ios,
          android: ICONS[name].android,
          web: ICONS[name].web,
        }}
        tintColor={color}
        size={resolvedSize}
        style={{ width: resolvedSize, height: resolvedSize }}
        {...(Platform.OS === 'ios' ? { weight: 'semibold' as const } : {})}
      />
    </View>
  );
}
