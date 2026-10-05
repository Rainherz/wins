import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  /** Leading icon inside the field. */
  icon?: IconName;
  /** Trailing control, for example a show/hide password button. */
  trailing?: React.ReactNode;
};

export function TextField({ label, icon, trailing, multiline, style, ...input }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {!!label && <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{label}</Text>}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.accent : colors.border,
            boxShadow: focused ? `0 0 0 3px ${colors.accentSoft}` : 'none',
          },
        ]}>
        {icon && <Icon name={icon} size={18} color={colors.textMuted} />}
        <TextInput
          {...input}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            input.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            input.onBlur?.(event);
          }}
          placeholderTextColor={colors.textMuted}
          style={[
            type.body,
            styles.input,
            multiline && styles.inputMultiline,
            { color: colors.text, outlineWidth: 0 },
            style,
          ]}
        />
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: spacing.md },
  input: { flex: 1, paddingVertical: spacing.sm },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top', paddingVertical: 0 },
});
