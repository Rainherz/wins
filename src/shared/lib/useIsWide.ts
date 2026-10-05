import { useWindowDimensions } from 'react-native';

import { WIDE_BREAKPOINT } from '@/shared/theme/tokens';

/** True when there is room for the sidebar layout. */
export function useIsWide() {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}
