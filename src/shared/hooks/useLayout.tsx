import { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { useResponsive } from '@/src/shared/utils/responsive';

/** Horizontal inset wrapper — aligns content with screen padding tokens */
export function ScreenSection({
  children,
  style,
  noPadding,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}) {
  const { screenPaddingX, contentMaxWidth } = useResponsive();

  return (
    <View
      style={[
        !noPadding && {
          paddingHorizontal: screenPaddingX,
          width: '100%',
          maxWidth: contentMaxWidth,
          alignSelf: 'center' as const,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Standard scroll content padding for stack/form screens */
export function useScrollContentStyle(extra?: ViewStyle): ViewStyle {
  const theme = useTheme();
  const { screenPaddingX, contentMaxWidth, sectionGap } = useResponsive();

  return useMemo(
    () =>
      StyleSheet.flatten([
        {
          paddingHorizontal: screenPaddingX,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
          gap: sectionGap,
          width: '100%' as const,
          maxWidth: contentMaxWidth,
          alignSelf: 'center' as const,
        },
        extra,
      ]) as ViewStyle,
    [theme, screenPaddingX, contentMaxWidth, sectionGap, extra],
  );
}

/** Header block for custom flat-list tab screens (expenses, budgets) */
export function useScreenHeaderStyle(topInset: number) {
  const theme = useTheme();
  const { screenPaddingX, contentMaxWidth, stackGap } = useResponsive();

  return useMemo(
    () => ({
      paddingTop: topInset + theme.spacing.md,
      paddingHorizontal: screenPaddingX,
      paddingBottom: stackGap,
      maxWidth: contentMaxWidth,
      width: '100%' as const,
      alignSelf: 'center' as const,
    }),
    [theme, topInset, screenPaddingX, contentMaxWidth, stackGap],
  );
}

/** List content area aligned with screen padding */
export function useScreenListStyle(bottomInset: number) {
  const { screenPaddingX, contentMaxWidth, stackGap } = useResponsive();

  return useMemo(
    () => ({
      paddingHorizontal: screenPaddingX,
      paddingTop: stackGap,
      paddingBottom: bottomInset,
      gap: stackGap,
      maxWidth: contentMaxWidth,
      width: '100%' as const,
      alignSelf: 'center' as const,
    }),
    [screenPaddingX, contentMaxWidth, stackGap, bottomInset],
  );
}
