import { Pressable, StyleSheet, Text } from 'react-native';

import { radius } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';

type Props = { label: string; accessibilityLabel: string; onPress: () => void };

export function HeaderButton({ label, accessibilityLabel, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={{ fontSize: 18, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
