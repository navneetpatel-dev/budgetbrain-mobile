import { useMemo } from 'react';
import {
  FlatList,
  FlatListProps,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useTabBarInset } from '@/shared/hooks/useTabBarInset';
import { useScreenListStyle } from '@/shared/hooks/useLayout';
import { useFabBottom } from '@/shared/hooks/useFabBottom';

/* ── Compact screen header (sticky) ── */

export function FeatureHeader({
  title,
  subtitle,
  eyebrow,
  actionIcon,
  onAction,
  actionLabel,
  footer,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actionIcon?: AppIconName;
  onAction?: () => void;
  actionLabel?: string;
  footer?: React.ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { screenPaddingX } = useResponsive();
  const styles = useMemo(() => createHeaderStyles(theme), [theme]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingHorizontal: screenPaddingX }]}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onAction && actionIcon ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel ?? 'Action'}
          >
            <LinearGradient
              colors={[theme.colors.primary + '33', theme.colors.gradientEnd + '22']}
              style={styles.actionGradient}
            >
              <AppIcon name={actionIcon} size={20} color={theme.colors.primary} />
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export function SearchField({
  placeholder,
  onPress,
  rightAction,
}: {
  placeholder: string;
  onPress: () => void;
  rightAction?: React.ReactNode;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createSearchStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <Pressable onPress={onPress} style={styles.field}>
        <AppIcon name="search" size={17} color={theme.colors.textTertiary} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </Pressable>
      {rightAction}
    </View>
  );
}

export function HeaderIconButton({
  icon,
  onPress,
  label,
  variant = 'soft',
}: {
  icon: AppIconName;
  onPress: () => void;
  label: string;
  variant?: 'soft' | 'solid';
}) {
  const theme = useTheme();
  const styles = useMemo(() => createIconBtnStyles(theme, variant), [theme, variant]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.88 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppIcon name={icon} size={20} color={variant === 'solid' ? theme.colors.onPrimary : theme.colors.primary} />
    </Pressable>
  );
}

/* ── Form helpers ── */

export function FormFieldLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: theme.colors.textTertiary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

export function OptionChips<T extends string>({
  options,
  value,
  onChange,
  getLabel = (v) => v,
  getColor,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  getLabel?: (v: T) => string;
  getColor?: (v: T) => string | undefined;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createChipStyles(theme), [theme]);

  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const selected = value === opt;
        const accent = getColor?.(opt) ?? theme.colors.primary;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.chip,
              selected && { backgroundColor: accent, borderColor: accent },
            ]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextActive]}>
              {getLabel(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OptionChipList({
  items,
  selectedId,
  onSelect,
}: {
  items: { id: string; label: string; color?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createChipStyles(theme), [theme]);

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const selected = selectedId === item.id;
        const accent = item.color ?? theme.colors.primary;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[
              styles.chip,
              selected && { backgroundColor: accent, borderColor: accent },
            ]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MultiOptionChips({
  options,
  selected,
  onToggle,
  getLabel = (v) => v,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  getLabel?: (v: string) => string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createChipStyles(theme), [theme]);

  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const accent = theme.colors.primary;
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            style={[
              styles.chip,
              isSelected && { backgroundColor: accent, borderColor: accent },
            ]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {getLabel(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ActionFab({ onPress, label = 'Add' }: { onPress: () => void; label?: string }) {
  const theme = useTheme();
  const bottom = useFabBottom();
  const styles = useMemo(() => createFabStyles(theme, bottom), [theme, bottom]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { transform: [{ scale: 0.94 }] }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <AppIcon name="add" size={26} color={theme.colors.onPrimary} />
      </LinearGradient>
    </Pressable>
  );
}

export function ScreenIntro({ eyebrow, subtitle }: { eyebrow?: string; subtitle?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createIntroStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/* ── Sticky header + FlatList ── */

export function StickyHeaderFlatScreen<T>({
  header,
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
  refreshControl,
  contentContainerStyle,
  ItemSeparatorComponent,
  inset = 'tab',
}: {
  header: React.ReactNode;
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  refreshControl?: FlatListProps<T>['refreshControl'];
  contentContainerStyle?: ViewStyle;
  ItemSeparatorComponent?: FlatListProps<T>['ItemSeparatorComponent'];
  inset?: 'tab' | 'stack';
}) {
  const theme = useTheme();
  const safeInsets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const bottomInset = inset === 'stack' ? safeInsets.bottom + theme.spacing.xxl : tabBarInset;
  const listStyle = useScreenListStyle(bottomInset);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {header}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[listStyle, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={refreshControl}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
}

function createHeaderStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      backgroundColor: t.colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    textCol: { flex: 1, minWidth: 0 },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: t.colors.textTertiary,
      marginBottom: 2,
    },
    title: {
      ...t.typography.titleSm,
      fontSize: 22,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginTop: 2,
    },
    actionBtn: { borderRadius: 14, overflow: 'hidden' },
    actionGradient: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    footer: { marginTop: t.spacing.sm },
  });
}

function createSearchStyles(t: AppTheme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' },
    field: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
      borderRadius: t.radii.lg,
      paddingHorizontal: t.spacing.md,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    placeholder: { ...t.typography.bodyMedium, color: t.colors.textTertiary, fontSize: 15 },
  });
}

function createIconBtnStyles(t: AppTheme, variant: 'soft' | 'solid') {
  return StyleSheet.create({
    btn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variant === 'solid' ? t.colors.primary : t.colors.primarySoft,
      borderWidth: variant === 'soft' ? 1 : 0,
      borderColor: t.colors.primary + '33',
    },
  });
}

function createChipStyles(t: AppTheme) {
  return StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: t.spacing.lg },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: t.radii.full,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.border,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    chipText: { fontSize: 13, fontWeight: '600', color: t.colors.text, textTransform: 'capitalize' },
    chipTextActive: { color: t.colors.onPrimary },
  });
}

function createFabStyles(t: AppTheme, bottom: number) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      bottom,
      right: 24,
      borderRadius: 28,
      ...t.shadows.lg,
    },
    gradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

function createIntroStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: { marginBottom: t.spacing.md },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: t.colors.textTertiary,
      marginBottom: 4,
    },
    subtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      lineHeight: 20,
    },
  });
}
