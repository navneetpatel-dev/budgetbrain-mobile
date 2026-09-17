import { useMemo, useCallback, useState } from 'react';
import {
  FlatList,
  FlatListProps,
  Pressable,
  RefreshControlProps,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useTabBarInset } from '@/shared/hooks/useTabBarInset';
import { useScreenInsets } from '@/shared/hooks/useLayout';
import { ensureArray } from '@/shared/utils/listData';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { ActionSheet } from '@/shared/components/ui/ActionSheet';

/* ── Uniform back navigation ── */

export function useStackBack(fallback: Href = '/') {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback);
  }, [router, fallback]);
}

/** Back to Profile tab when opened from settings links */
export function useProfileBack() {
  return useStackBack('/(tabs)/settings' as Href);
}

export function BackButton({
  onPress,
  label = 'Go back',
  size = 'default',
}: {
  onPress?: () => void;
  label?: string;
  size?: 'default' | 'compact';
}) {
  const theme = useTheme();
  const stackBack = useStackBack();
  const styles = useMemo(() => createHeaderStyles(theme), [theme]);
  const compact = size === 'compact';

  return (
    <Pressable
      onPress={onPress ?? stackBack}
      style={({ pressed }) => [
        styles.backBtn,
        compact && styles.backBtnCompact,
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppIcon name="arrowLeft" size={compact ? 18 : 20} color={theme.colors.primary} />
    </Pressable>
  );
}

/** Compact single-row nav header for stack / profile sub-screens */
export function StackNavHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  actionIcon,
  onAction,
  actionLabel,
  footer,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actionIcon?: AppIconName;
  onAction?: () => void;
  actionLabel?: string;
  footer?: React.ReactNode;
}) {
  const theme = useTheme();
  const stackBack = useStackBack();
  const insets = useSafeAreaInsets();
  const { paddingX } = useScreenInsets();
  const styles = useMemo(() => createStackNavStyles(theme), [theme]);
  const handleBack = onBack ?? stackBack;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6, ...paddingX }]}>
      <View style={styles.row}>
        {showBack ? (
          <BackButton onPress={handleBack} label="Go back" size="compact" />
        ) : null}

        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onAction && actionIcon ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel ?? 'Action'}
          >
            <AppIcon name={actionIcon} size={18} color={theme.colors.primary} />
          </Pressable>
        ) : null}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

/* ── Compact screen header (sticky) ── */

export function FeatureHeader({
  title,
  subtitle,
  eyebrow,
  icon,
  actionIcon,
  onAction,
  actionLabel,
  footer,
  showBack,
  onBack,
  variant = 'tab',
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: AppIconName;
  actionIcon?: AppIconName;
  onAction?: () => void;
  actionLabel?: string;
  footer?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  /** `stack` = profile sub-screens & modals; `tab` = main tab roots */
  variant?: 'tab' | 'stack';
}) {
  const theme = useTheme();
  const stackBack = useStackBack();
  const insets = useSafeAreaInsets();
  const { paddingX } = useScreenInsets();
  const styles = useMemo(() => createHeaderStyles(theme), [theme]);

  const handleBack = onBack ?? stackBack;

  if (variant === 'stack') {
    return (
      <StackNavHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onBack={handleBack}
        actionIcon={actionIcon}
        onAction={onAction}
        actionLabel={actionLabel}
        footer={footer}
      />
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 8, ...paddingX },
      ]}
    >
      <View style={styles.mainRow}>
        {showBack ? (
          <BackButton onPress={handleBack} label="Go back" size="compact" />
        ) : null}
        {icon ? (
          <LinearGradient
            colors={[theme.colors.primary + '38', theme.colors.gradientEnd + '22']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconRing}
          >
            <AppIcon name={icon} size={20} color={theme.colors.primary} />
          </LinearGradient>
        ) : null}

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
      <Pressable onPress={onPress} style={styles.field} accessibilityRole="button" accessibilityLabel={placeholder}>
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
  badge,
}: {
  icon: AppIconName;
  onPress: () => void;
  label: string;
  variant?: 'soft' | 'solid';
  /** Show a small active indicator (e.g. filter count). */
  badge?: number | boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createIconBtnStyles(theme, variant), [theme, variant]);
  const showBadge = typeof badge === 'number' ? badge > 0 : !!badge;
  const badgeLabel = typeof badge === 'number' && badge > 0 ? String(badge > 9 ? '9+' : badge) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, showBadge && styles.btnActive, pressed && { opacity: 0.88 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppIcon name={icon} size={20} color={variant === 'solid' ? theme.colors.onPrimary : theme.colors.primary} />
      {showBadge ? (
        <View style={styles.badge}>
          {badgeLabel ? <Text style={styles.badgeText}>{badgeLabel}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

/* ── Form helpers ── */

export function FormFieldLabel({ children, error }: { children: string; error?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createFormLabelStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{children}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Chip({
  label,
  selected,
  accent,
  onPress,
  styles,
  disabled,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
  styles: ReturnType<typeof createChipStyles>;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        selected && {
          backgroundColor: accent + '22',
          borderColor: accent,
        },
        disabled && styles.chipDisabled,
        pressed && !disabled && { opacity: 0.88, transform: [{ scale: 0.97 }] },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {selected ? (
        <View style={[styles.chipDot, { backgroundColor: accent }]}>
          <AppIcon name="checkmark" size={10} color={theme.colors.onPrimary} />
        </View>
      ) : null}
      <Text style={[styles.chipText, selected && { color: accent, fontWeight: '700' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function OptionChips<T extends string>({
  options,
  value,
  onChange,
  getLabel = (v) => v,
  getColor,
  error,
  disabled,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  getLabel?: (v: T) => string;
  getColor?: (v: T) => string | undefined;
  error?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createChipStyles(theme), [theme]);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** Shared rule with web: ≤4 segmented, 5–8 chips, >8 sheet. */
  const useSelect = options.length > 8;
  const useSegmented = options.length <= 4;

  if (useSelect) {
    const hasValue = options.includes(value);
    return (
      <View style={styles.container}>
        <Pressable
          onPress={disabled ? undefined : () => setSheetOpen(true)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.selectControl,
            disabled && styles.chipDisabled,
            pressed && !disabled && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={hasValue ? getLabel(value) : 'Choose'}
        >
          <Text style={[styles.selectValue, !hasValue && { color: theme.colors.textTertiary }]}>
            {hasValue ? getLabel(value) : 'Choose'}
          </Text>
          <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ActionSheet
          visible={sheetOpen}
          title="Choose option"
          onClose={() => setSheetOpen(false)}
          items={options.map((opt) => ({
            id: opt,
            label: getLabel(opt),
            onPress: () => onChange(opt),
          }))}
        />
      </View>
    );
  }

  if (useSegmented) {
    return (
      <View style={styles.container}>
        <View style={styles.segmented}>
          {options.map((opt) => {
            const selected = value === opt;
            const accent = getColor?.(opt) ?? theme.colors.primary;
            return (
              <Pressable
                key={opt}
                onPress={disabled ? undefined : () => onChange(opt)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.segment,
                  selected && { backgroundColor: accent + '22' },
                  disabled && styles.chipDisabled,
                  pressed && !disabled && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                  style={[styles.segmentText, selected && { color: accent }]}
                >
                  {getLabel(opt)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {options.map((opt) => {
          const selected = value === opt;
          const accent = getColor?.(opt) ?? theme.colors.primary;
          return (
            <Pressable
              key={opt}
              onPress={disabled ? undefined : () => onChange(opt)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.chip,
                selected && { backgroundColor: accent + '22', borderColor: accent },
                disabled && styles.chipDisabled,
                pressed && !disabled && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && { color: accent }]}>
                {getLabel(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function OptionChipList({
  items,
  selectedId,
  onSelect,
  error,
  disabled,
}: {
  items: { id: string; label: string; color?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createChipStyles(theme), [theme]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const safeItems = ensureArray<{ id: string; label: string; color?: string }>(items);
  const useSelect = safeItems.length > 8;
  const selectedItem = safeItems.find((i) => i.id === selectedId);

  if (useSelect) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={disabled ? undefined : () => setSheetOpen(true)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.selectControl,
            disabled && styles.chipDisabled,
            pressed && !disabled && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={selectedItem?.label ?? 'Choose'}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            {selectedItem?.color ? (
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: selectedItem.color }} />
            ) : null}
            <Text style={styles.selectValue}>{selectedItem?.label ?? 'Choose'}</Text>
          </View>
          <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ActionSheet
          visible={sheetOpen}
          title="Choose option"
          onClose={() => setSheetOpen(false)}
          items={safeItems.map((item) => ({
            id: item.id,
            label: item.label,
            onPress: () => onSelect(item.id),
          }))}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {safeItems.map((item) => {
          const selected = selectedId === item.id;
          const accent = item.color ?? theme.colors.primary;
          return (
            <Pressable
              key={item.id}
              onPress={disabled ? undefined : () => onSelect(item.id)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.chip,
                selected && { backgroundColor: accent + '22', borderColor: accent },
                disabled && styles.chipDisabled,
                pressed && !disabled && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={[styles.colorDot, { backgroundColor: accent }]} />
              <Text style={[styles.chipText, selected && { color: accent, fontWeight: '700' }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function MultiOptionChips({
  options,
  selected,
  onToggle,
  getLabel = (v) => v,
  error,
  disabled,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  getLabel?: (v: string) => string;
  error?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createChipStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const accent = theme.colors.primary;
          return (
            <Chip
              key={opt}
              label={getLabel(opt)}
              selected={isSelected}
              accent={accent}
              onPress={() => onToggle(opt)}
              styles={styles}
              disabled={disabled}
            />
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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

/** Stack screen: sticky header + scroll body (Profile sub-screens, forms) */
export function StackScrollScreen({
  header,
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  refreshControl,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  return (
    <ScreenWrapper
      header={header}
      inset="stack"
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={refreshControl}
    >
      {children}
    </ScreenWrapper>
  );
}

/** Form / detail stack screen with uniform header + back button */
export function FormStackScreen({
  eyebrow,
  title,
  subtitle,
  icon,
  showBack = true,
  onBack,
  refreshControl,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  showBack?: boolean;
  onBack?: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({ body: { gap: 2 } }), []);

  return (
    <StackScrollScreen
      header={
        <FeatureHeader
          variant="stack"
          showBack={showBack}
          onBack={onBack}
          icon={icon}
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
        />
      }
      contentContainerStyle={{ paddingTop: theme.spacing.sm }}
      refreshControl={refreshControl}
    >
      <View style={styles.body}>{children}</View>
    </StackScrollScreen>
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
  ListFooterComponent,
  refreshControl,
  contentContainerStyle,
  ItemSeparatorComponent,
  onEndReached,
  onEndReachedThreshold,
  inset = 'tab',
}: {
  header: React.ReactNode;
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  ListFooterComponent?: FlatListProps<T>['ListFooterComponent'];
  refreshControl?: FlatListProps<T>['refreshControl'];
  contentContainerStyle?: ViewStyle;
  ItemSeparatorComponent?: FlatListProps<T>['ItemSeparatorComponent'];
  onEndReached?: FlatListProps<T>['onEndReached'];
  onEndReachedThreshold?: FlatListProps<T>['onEndReachedThreshold'];
  inset?: 'tab' | 'stack';
}) {
  const theme = useTheme();
  const safeInsets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const bottomInset = inset === 'stack' ? safeInsets.bottom + theme.spacing.xxl : tabBarInset;
  const { frame, stackGap } = useScreenInsets();
  const listStyle = useMemo(
    () => ({
      ...frame,
      paddingTop: stackGap,
      paddingBottom: bottomInset,
      gap: stackGap,
    }),
    [frame, stackGap, bottomInset],
  );

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
        ListFooterComponent={ListFooterComponent}
        refreshControl={refreshControl}
        ItemSeparatorComponent={ItemSeparatorComponent}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
      />
    </View>
  );
}

function createHeaderStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      backgroundColor: t.colors.surfaceContainerLow ?? t.colors.background,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    headerIconRing: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
    },
    backBtnCompact: {
      width: 36,
      height: 36,
      borderRadius: 10,
    },
    textCol: { flex: 1, minWidth: 0 },
    eyebrow: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      marginBottom: 3,
      textTransform: 'capitalize',
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
      marginTop: 3,
      lineHeight: 18,
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
    footer: { marginTop: 6 },
  });
}

function createStackNavStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      backgroundColor: t.colors.surfaceContainerLow ?? t.colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 36,
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textSecondary,
      marginTop: 1,
      lineHeight: 16,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
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
    btnActive: {
      borderColor: t.colors.primary,
      borderWidth: 1.5,
      backgroundColor: t.colors.primary + '28',
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 14,
      height: 14,
      borderRadius: 7,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primary,
      borderWidth: 1.5,
      borderColor: t.colors.surface,
    },
    badgeText: {
      color: t.colors.onPrimary,
      fontSize: 9,
      fontWeight: '700',
      lineHeight: 11,
    },
  });
}

function createChipStyles(t: AppTheme) {
  return StyleSheet.create({
    /** Match Input field spacing so labels below chips are not cramped. */
    container: { marginBottom: t.spacing.lg },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    scrollRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
    segmented: {
      flexDirection: 'row',
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      overflow: 'hidden',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    segment: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      borderWidth: 0,
    },
    segmentText: {
      ...t.typography.label,
      color: t.colors.text,
      textAlign: 'center',
    },
    selectControl: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    selectValue: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      textTransform: 'capitalize',
      flex: 1,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    chipDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    chipText: { fontSize: 13, fontWeight: '600', color: t.colors.text, textTransform: 'capitalize' },
    chipDisabled: { opacity: 0.5 },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs, fontWeight: '500' },
  });
}

function createFormLabelStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.sm,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    error: { fontSize: 12, fontWeight: '500', color: t.colors.danger },
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
      ...t.typography.label,
      color: t.colors.textTertiary,
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    subtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      lineHeight: 20,
    },
  });
}
