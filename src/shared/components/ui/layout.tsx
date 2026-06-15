import { useMemo, forwardRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ScrollViewProps,
  ViewStyle,
  RefreshControl,
  type RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useScreenInsets } from '@/shared/hooks/useLayout';
import { useTabBarInset, useFloatingBlockGap } from '@/shared/hooks/useTabBarInset';

export type ScreenInset = 'tab' | 'stack' | 'none';

function useBottomInset(inset: ScreenInset) {
  const theme = useTheme();
  const safeInsets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();

  if (inset === 'tab') return tabBarInset;
  if (inset === 'stack') return safeInsets.bottom + theme.spacing.xxl;
  return safeInsets.bottom + theme.spacing.md;
}

/**
 * Single screen shell — consistent horizontal insets (matches floating tab bar),
 * optional sticky header, scroll or static body, tab-bar-safe bottom padding.
 */
export function ScreenWrapper({
  header,
  children,
  inset = 'tab',
  scroll = true,
  contentContainerStyle,
  refreshControl,
  style,
  ...scrollProps
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  inset?: ScreenInset;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: ViewStyle;
} & Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'refreshControl' | 'style'>) {
  const theme = useTheme();
  const { frame, sectionGap } = useScreenInsets();
  const blockGap = useFloatingBlockGap();
  const bottomInset = useBottomInset(inset);
  const contentGap = inset === 'tab' ? blockGap : sectionGap;

  const bodyStyle = useMemo(
    () =>
      StyleSheet.flatten([
        frame,
        {
          paddingTop: theme.spacing.md,
          paddingBottom: bottomInset,
          gap: contentGap,
        },
        contentContainerStyle,
      ]),
    [frame, theme.spacing.md, bottomInset, contentGap, contentContainerStyle],
  );

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {header}
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={bodyStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, bodyStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

interface StickyHeaderScreenProps extends Omit<ScrollViewProps, 'children'> {
  header: React.ReactNode;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  inset?: ScreenInset;
}

/** @deprecated Prefer ScreenWrapper — kept for existing imports */
export function StickyHeaderScreen({
  header,
  children,
  contentContainerStyle,
  refreshControl,
  inset = 'tab',
  style,
  ...props
}: StickyHeaderScreenProps) {
  return (
    <ScreenWrapper
      header={header}
      inset={inset}
      contentContainerStyle={contentContainerStyle}
      refreshControl={refreshControl}
      style={style as ViewStyle}
      {...props}
    >
      {children}
    </ScreenWrapper>
  );
}

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  padded?: boolean;
  safeTop?: boolean;
  inset?: ScreenInset;
}

export const Screen = forwardRef<ScrollView, ScreenProps>(function Screen(
  {
    children,
    padded = true,
    safeTop = false,
    inset = 'tab',
    contentContainerStyle,
    refreshControl,
    ...props
  },
  ref,
) {
  const theme = useTheme();
  const safeInsets = useSafeAreaInsets();
  const { frame, sectionGap } = useScreenInsets();
  const bottomInset = useBottomInset(inset);

  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        {
          paddingBottom: bottomInset,
          paddingTop: safeTop ? safeInsets.top : 0,
          gap: sectionGap,
        },
        padded && frame,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      {...props}
    >
      {children}
    </ScrollView>
  );
});

export function ScreenContainer({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}) {
  const theme = useTheme();
  const { frame } = useScreenInsets();

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.background },
        padded && frame,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ResponsiveGrid({
  children,
  columns,
  gap,
  style,
}: {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}) {
  const { columns: defaultCols, gridGap } = useResponsive();
  const cols = columns ?? defaultCols;
  const gridGapValue = gap ?? gridGap;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: gridGapValue,
        },
        item: {
          flexGrow: 1,
          flexShrink: 0,
          flexBasis: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
          minWidth: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
          maxWidth: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
        },
      }),
    [cols, gridGapValue],
  );

  return (
    <View style={[styles.grid, style]}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <View key={i} style={styles.item}>
              {child}
            </View>
          ))
        : children}
    </View>
  );
}

/** Dashboard metric cards: full-width income/expense, paired goals/net-worth on phone & tablet */
export function SummaryMetricsGrid({
  children,
  gap,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}) {
  const { isLargeTablet, gridGap } = useResponsive();
  const gridGapValue = gap ?? gridGap;
  const items = Array.isArray(children) ? children : [children];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: { gap: gridGapValue },
        row: { flexDirection: 'row', gap: gridGapValue },
        cell: { flex: 1, minWidth: 0 },
        quad: { flex: 1, minWidth: 0 },
      }),
    [gridGapValue],
  );

  if (isLargeTablet) {
    return (
      <View style={[styles.row, style]}>
        {items.map((child, i) => (
          <View key={i} style={styles.quad}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.stack, style]}>
      {items[0] ? <View style={styles.cell}>{items[0]}</View> : null}
      {items[1] ? <View style={styles.cell}>{items[1]}</View> : null}
      {items[2] || items[3] ? (
        <View style={styles.row}>
          {items[2] ? <View style={styles.cell}>{items[2]}</View> : null}
          {items[3] ? <View style={styles.cell}>{items[3]}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

export function ScreenLoader() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: theme.colors.primarySoft, borderTopColor: theme.colors.primary }} />
    </View>
  );
}

export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { frame } = useScreenInsets();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + theme.spacing.lg, gap: theme.spacing.md }, frame]}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 72,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surfaceHover,
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

export { RefreshControl };
