import { useMemo } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ScrollViewProps,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';
import { useTabBarInset } from '@/src/hooks/useTabBarInset';

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  padded?: boolean;
  safeTop?: boolean;
}

export function Screen({
  children,
  padded = true,
  safeTop = false,
  contentContainerStyle,
  refreshControl,
  ...props
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { horizontalPadding, contentMaxWidth } = useResponsive();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        {
          paddingBottom: tabBarInset,
          paddingTop: safeTop ? insets.top : 0,
        },
        padded && { paddingHorizontal: horizontalPadding },
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
}

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
  const { horizontalPadding, contentMaxWidth } = useResponsive();

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.background },
        padded && { paddingHorizontal: horizontalPadding },
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
          flexShrink: 0,
          flexBasis: cols === 1 ? '100%' : cols === 2 ? '47%' : '30%',
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

export { RefreshControl };
