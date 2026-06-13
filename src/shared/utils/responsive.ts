import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
} as const;

/** Single source of truth for screen rhythm — 4pt grid, tight professional insets */
const PHONE = {
  screenPaddingX: 16,
  tabBarPaddingX: 10,
  sectionGap: 16,
  stackGap: 10,
  gridGap: 10,
  inlineGap: 6,
  cardPadding: 16,
  tabBarBottomInset: 8,
} as const;

const TABLET = {
  screenPaddingX: 20,
  tabBarPaddingX: 14,
  sectionGap: 20,
  stackGap: 12,
  gridGap: 12,
  inlineGap: 8,
  cardPadding: 18,
  tabBarBottomInset: 12,
} as const;

const LARGE_TABLET = {
  screenPaddingX: 24,
  tabBarPaddingX: 16,
  sectionGap: 24,
  stackGap: 14,
  gridGap: 14,
  inlineGap: 8,
  cardPadding: 20,
  tabBarBottomInset: 12,
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLargeTablet = width >= BREAKPOINTS.largeTablet;
  const tokens = isLargeTablet ? LARGE_TABLET : isTablet ? TABLET : PHONE;

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isPhone: !isTablet,
    contentMaxWidth: isLargeTablet ? 840 : isTablet ? 720 : undefined,
    columns: isLargeTablet ? 3 : isTablet ? 2 : 1,
    ...tokens,
    /** @deprecated use screenPaddingX */
    horizontalPadding: tokens.screenPaddingX,
  };
}

export type LayoutTokens = ReturnType<typeof useResponsive>;
