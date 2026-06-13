import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/src/shared/utils/responsive';

/** Height of floating tab bar body (excluding safe area) */
const TAB_BAR_BODY = 84;
/** FAB protrudes above the bar */
const FAB_OVERFLOW = 36;
/** Extra breathing room below last list item */
const TAB_BAR_EXTRA = 16;

export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  const { tabBarBottomInset } = useResponsive();
  return insets.bottom + tabBarBottomInset + TAB_BAR_BODY + FAB_OVERFLOW + TAB_BAR_EXTRA;
}
