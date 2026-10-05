import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { useTheme } from '@/shared/theme/ThemeProvider';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  name: IconName;
  size?: number;
  /** Defaults to the primary text color. */
  color?: string;
};

/** One icon family (Material Community, outline style) so strokes stay consistent. */
export function Icon({ name, size = 20, color }: Props) {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? colors.text} />;
}
