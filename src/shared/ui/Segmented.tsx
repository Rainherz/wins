import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Text } from './Text';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** A small set of mutually exclusive choices that all stay visible, such as a list filter. */
export function Segmented<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.option, selected && { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
            <Text style={[type.bodySmall, { color: selected ? colors.text : colors.textMuted, fontWeight: selected ? '600' : '500' }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: radius.md, alignSelf: 'flex-start' },
  option: { minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.sm },
});
