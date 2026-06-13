import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/shared/utils/responsive';

const TAB_BAR_BODY = 84;
const FAB_MARGIN = 12;

/** Bottom offset for floating action buttons above the tab bar */
export function useFabBottom(aboveTabBar = false) {
  const insets = useSafeAreaInsets();
  const { tabBarBottomInset } = useResponsive();

  if (aboveTabBar) {
    return insets.bottom + tabBarBottomInset + TAB_BAR_BODY + FAB_MARGIN;
  }

  return insets.bottom + 24;
}
