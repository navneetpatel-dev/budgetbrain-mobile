import { useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';

/** Android stack/modals often report 0 bottom inset while the system nav still overlaps. */
const ANDROID_NAV_MIN = 32;

/** Bottom inset that still works inside Expo Router modal screens. */
export function useBottomSafeInset() {
  const insets = useSafeAreaInsets();
  const windowBottom = initialWindowMetrics?.insets.bottom ?? 0;
  return Math.max(
    insets.bottom,
    windowBottom,
    Platform.OS === 'android' ? ANDROID_NAV_MIN : 0,
  );
}

/** Horizontal insets aligned with the floating tab bar — use for all screen content */
export function useScreenInsets() {
  const { tabBarPaddingX, contentMaxWidth, sectionGap, stackGap } = useResponsive();

  return useMemo(
    () => ({
      paddingHorizontal: tabBarPaddingX,
      contentMaxWidth,
      sectionGap,
      stackGap,
      paddingX: {
        paddingHorizontal: tabBarPaddingX,
      },
      frame: {
        paddingHorizontal: tabBarPaddingX,
        width: '100%' as const,
        maxWidth: contentMaxWidth,
        alignSelf: 'center' as const,
      },
    }),
    [tabBarPaddingX, contentMaxWidth, sectionGap, stackGap],
  );
}

/** Section grouping inside a padded screen — does not add horizontal padding by default */
export function ScreenSection({
  children,
  style,
  padded,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Only use when the section sits outside a ScreenWrapper / padded scroll body */
  padded?: boolean;
}) {
  const { frame } = useScreenInsets();

  return (
    <View style={[padded ? frame : { width: '100%' }, style]}>
      {children}
    </View>
  );
}

/** Standard scroll content padding for stack/form screens */
export function useScrollContentStyle(extra?: ViewStyle): ViewStyle {
  const theme = useTheme();
  const { frame, sectionGap } = useScreenInsets();

  return useMemo(
    () =>
      StyleSheet.flatten([
        {
          ...frame,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
          gap: sectionGap,
        },
        extra,
      ]) as ViewStyle,
    [theme, frame, sectionGap, extra],
  );
}

/** Header block for custom flat-list tab screens (expenses, budgets) */
export function useScreenHeaderStyle(topInset: number) {
  const theme = useTheme();
  const { frame, stackGap } = useScreenInsets();

  return useMemo(
    () => ({
      ...frame,
      paddingTop: topInset + theme.spacing.md,
      paddingBottom: stackGap,
    }),
    [theme, topInset, frame, stackGap],
  );
}

/** List content area aligned with screen padding */
export function useScreenListStyle(bottomInset: number) {
  const { frame, stackGap } = useScreenInsets();

  return useMemo(
    () => ({
      ...frame,
      paddingTop: stackGap,
      paddingBottom: bottomInset,
      gap: stackGap,
    }),
    [frame, stackGap, bottomInset],
  );
}
