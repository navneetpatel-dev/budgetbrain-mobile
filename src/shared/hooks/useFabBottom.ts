import { useBottomSafeInset } from '@/shared/hooks/useLayout';
import { useResponsive } from '@/shared/utils/responsive';

const TAB_BAR_BODY = 84;
const FAB_MARGIN = 12;

/** Bottom offset for floating action buttons above the tab bar */
export function useFabBottom(aboveTabBar = false) {
  const bottomSafe = useBottomSafeInset();
  const { tabBarBottomInset } = useResponsive();

  if (aboveTabBar) {
    return bottomSafe + tabBarBottomInset + TAB_BAR_BODY + FAB_MARGIN;
  }

  return bottomSafe + 24;
}
