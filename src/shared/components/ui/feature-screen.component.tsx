import { useMemo, useCallback, useState } from 'react';
import {
  FlatList,
  FlatListProps,
  Pressable,
  RefreshControlProps,
  ScrollView,
  ScrollViewProps,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import DraggableFlatList, {
  type DragEndParams,
  type RenderItem as DraggableRenderItem,
} from 'react-native-draggable-flatlist';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useTabBarInset } from '@/shared/hooks/useTabBarInset.hook';
import { useScreenInsets, useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { ensureArray } from '@/shared/utils/listData';
import { useFabBottom } from '@/shared/hooks/useFabBottom.hook';
import { ScreenWrapper } from '@/shared/components/ui/layout.component';
import { ActionSheet } from '@/shared/components/ui/ActionSheet.component';
import {
  formStackStyles,
  createHeaderStyles,
  createStackNavStyles,
  createSearchStyles,
  createIconBtnStyles,
  createChipStyles,
  createFormLabelStyles,
  createFabStyles,
  createIntroStyles,
} from './feature-screen.styles';

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
  const styles = formStackStyles;

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

function useStickyListLayout(inset: 'tab' | 'stack', extra?: ViewStyle) {
  const theme = useTheme();
  const bottomSafe = useBottomSafeInset();
  const tabBarInset = useTabBarInset();
  const bottomInset = inset === 'stack' ? bottomSafe + theme.spacing.xl : tabBarInset;
  const { frame, stackGap } = useScreenInsets();
  return useMemo(
    () => [
      {
        ...frame,
        paddingTop: stackGap,
        paddingBottom: bottomInset,
        gap: stackGap,
      },
      extra,
    ],
    [frame, stackGap, bottomInset, extra]
  );
}

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
  const bottomSafe = useBottomSafeInset();
  const tabBarInset = useTabBarInset();
  const bottomInset = inset === 'stack' ? bottomSafe + theme.spacing.xl : tabBarInset;
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

/* ── Sticky header + drag-to-reorder list ──
 * A separate component (not a mode flag on StickyHeaderFlatScreen) since
 * DraggableFlatList's renderItem shape ({item, drag, isActive}) differs from
 * FlatList's ({item, index}) — keeping them distinct avoids widening the
 * widely-used StickyHeaderFlatScreen's renderItem type for every caller.
 */
export function SortableStickyHeaderFlatScreen<T>({
  header,
  data,
  renderItem,
  keyExtractor,
  onDragEnd,
  ListEmptyComponent,
  ListHeaderComponent,
  refreshControl,
  contentContainerStyle,
  inset = 'tab',
}: {
  header: React.ReactNode;
  data: T[];
  renderItem: DraggableRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onDragEnd: (params: DragEndParams<T>) => void;
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  refreshControl?: FlatListProps<T>['refreshControl'];
  contentContainerStyle?: ViewStyle;
  inset?: 'tab' | 'stack';
}) {
  const theme = useTheme();
  const [listStyle, extraStyle] = useStickyListLayout(inset, contentContainerStyle);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {header}
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onDragEnd={onDragEnd}
        contentContainerStyle={[listStyle, extraStyle]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={refreshControl}
        activationDistance={8}
      />
    </View>
  );
}
