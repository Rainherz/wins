import { StyleSheet, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
};

/** An error the user can act on: says what happened and offers a way out. */
export function ErrorNotice({ message, onRetry, onDismiss }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.box, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert">
      <Icon name="alert-circle-outline" size={22} color={colors.danger} />
      <View style={styles.body}>
        <Text style={[type.bodySmall, { color: colors.text }]}>{message}</Text>
        {(onRetry || onDismiss) && (
          <View style={styles.actions}>
            {onRetry && <Button label="Reintentar" icon="refresh" variant="secondary" onPress={onRetry} />}
            {onDismiss && <Button label="Cerrar aviso" variant="quiet" onPress={onDismiss} />}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md },
  body: { flex: 1, gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
