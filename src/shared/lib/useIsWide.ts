import { useWindowDimensions } from 'react-native';

import { TWO_COLUMN_BREAKPOINT, WIDE_BREAKPOINT } from '@/shared/theme/tokens';

/** True when there is room for the sidebar layout. */
export function useIsWide() {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}

/** True when a screen has enough room to split its content into two columns. */
export function useIsTwoColumn() {
  return useWindowDimensions().width >= TWO_COLUMN_BREAKPOINT;
}
