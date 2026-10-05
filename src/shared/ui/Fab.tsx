import { Pressable, StyleSheet, Text } from 'react-native';

import { radius } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';

type Props = { onPress: () => void; accessibilityLabel: string };

export function Fab({ onPress, accessibilityLabel }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.plus, { color: colors.onAccent }]}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  plus: { fontSize: 30, lineHeight: 32, fontWeight: '500' },
});
