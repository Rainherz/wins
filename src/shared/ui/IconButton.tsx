import { Pressable, StyleSheet } from 'react-native';

import { radius } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** Filled icon color, for toggled-on states such as a starred win. */
  color?: string;
  size?: number;
  disabled?: boolean;
};

/** 44x44 target regardless of the drawn icon size. */
export function IconButton({ icon, accessibilityLabel, onPress, color, size = 20, disabled }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed, hovered }) => [
        styles.button,
        { backgroundColor: hovered || pressed ? colors.surfaceMuted : 'transparent' },
        disabled && { opacity: 0.4 },
      ]}>
      <Icon name={icon} size={size} color={color ?? colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
