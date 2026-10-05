import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  /** primary: the one main action. secondary: outlined. quiet: text only. danger: destructive. */
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  icon?: IconName;
  /** Put the icon after the label, for example a dropdown arrow. */
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  /** Stretch to the full width of the container. */
  block?: boolean;
  /** Where the content sits when the button is wider than its content. */
  align?: 'center' | 'start';
  /** Drop the horizontal padding so the label lines up with surrounding text. */
  flush?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'start',
  disabled = false,
  block = false,
  align = 'center',
  flush = false,
}: Props) {
  const { colors } = useTheme();

  const foreground =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'secondary'
        ? colors.text
        : variant === 'danger'
          ? colors.danger
          : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed, hovered }) => [
        styles.base,
        block && styles.block,
        align === 'start' && { alignItems: 'flex-start' },
        flush && { paddingHorizontal: 0 },
        variant === 'primary' && {
          backgroundColor: colors.accent,
          boxShadow: pressed ? 'none' : colors.shadowCard,
          opacity: hovered ? 0.92 : 1,
        },
        variant === 'secondary' && {
          backgroundColor: hovered ? colors.surfaceMuted : colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        },
        variant === 'quiet' && { backgroundColor: hovered ? colors.surfaceMuted : 'transparent' },
        variant === 'danger' && {
          backgroundColor: hovered ? colors.dangerSoft : colors.surface,
          borderColor: colors.danger + '55',
          borderWidth: 1,
        },
        pressed && { transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.4 },
      ]}>
      <View style={styles.content}>
        {icon && iconPosition === 'start' && <Icon name={icon} size={18} color={foreground} />}
        <Text style={[type.bodySmall, { color: foreground, fontWeight: '600' }]}>{label}</Text>
        {icon && iconPosition === 'end' && <Icon name={icon} size={18} color={foreground} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  block: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
