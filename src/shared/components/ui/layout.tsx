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
import { useTabBarInset, useFloatingBlockGap } from '@/shared/hooks/useTabBarInset';

interface StickyHeaderScreenProps extends Omit<ScrollViewProps, 'children'> {
  header: React.ReactNode;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  inset?: 'tab' | 'stack';
}

/** Fixed header + scrollable body with tab-bar-safe bottom padding */
export function StickyHeaderScreen({
  header,
  children,
  contentContainerStyle,
  refreshControl,
  inset = 'tab',
  ...props
}: StickyHeaderScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const blockGap = useFloatingBlockGap();
  const bottomInset = inset === 'stack' ? insets.bottom + theme.spacing.xxl : tabBarInset;
  const { sectionGap, contentMaxWidth, tabBarPaddingX } = useResponsive();
  const horizontalPadding = tabBarPaddingX;
  const contentGap = inset === 'tab' ? blockGap : sectionGap;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {header}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          {
            paddingTop: theme.spacing.md,
            paddingBottom: bottomInset,
            paddingHorizontal: horizontalPadding,
            gap: contentGap,
            width: '100%',
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
}

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  padded?: boolean;
  safeTop?: boolean;
}

export const Screen = forwardRef<ScrollView, ScreenProps>(function Screen(
  {
    children,
    padded = true,
    safeTop = false,
    contentContainerStyle,
    refreshControl,
    ...props
  },
  ref
) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { screenPaddingX, contentMaxWidth, sectionGap } = useResponsive();

  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        {
          paddingBottom: tabBarInset,
          paddingTop: safeTop ? insets.top : 0,
          gap: sectionGap,
        },
        padded && { paddingHorizontal: screenPaddingX },
        contentMaxWidth ? { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' } : undefined,
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
  const { screenPaddingX, contentMaxWidth } = useResponsive();

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.background },
        padded && { paddingHorizontal: screenPaddingX },
        contentMaxWidth ? { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' } : undefined,
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
  const responsive = useResponsive();
  const cols = columns ?? responsive.columns;
  const gridGap = gap ?? responsive.gridGap;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: gridGap,
        },
        item: {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
          minWidth: cols === 1 ? '100%' : cols === 2 ? 160 : 140,
        },
      }),
    [cols, gridGap]
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
  const { screenPaddingX } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: screenPaddingX, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
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
