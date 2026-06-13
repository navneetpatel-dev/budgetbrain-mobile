import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLargeTablet = width >= BREAKPOINTS.largeTablet;

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isPhone: !isTablet,
    /** Max content width on tablet — keeps readable line length */
    contentMaxWidth: isLargeTablet ? 840 : isTablet ? 720 : undefined,
    horizontalPadding: isTablet ? 28 : 20,
    gridGap: isTablet ? 16 : 12,
    columns: isLargeTablet ? 3 : isTablet ? 2 : 1,
    tabBarBottomInset: isTablet ? 20 : 12,
  };
}
