import { StyleSheet, View } from 'react-native';

import { spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Text } from './Text';

type Props = {
  title: string;
  /** One sentence under the title. */
  description?: string;
  onClose: () => void;
};

export function SheetHeader({ title, description, onClose }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[type.title, { color: colors.text }]}>{title}</Text>
        {description && <Text style={[type.bodySmall, { color: colors.textMuted }]}>{description}</Text>}
      </View>
      <IconButton icon="close" accessibilityLabel="Cerrar" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs, paddingTop: spacing.sm },
});
