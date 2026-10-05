import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { messageOf } from '@/shared/lib/messageOf';
import { spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { SheetHeader } from './SheetHeader';
import { Text } from './Text';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

/** Asks before something destructive. Alert.alert does nothing on the web, so this is a sheet. */
export function ConfirmSheet({ visible, ...rest }: Props) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      <Form {...rest} />
    </Sheet>
  );
}

function Form({ title, description, confirmLabel, onConfirm, onClose }: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  };

  return (
    <View style={styles.form}>
      <SheetHeader title={title} description={description} onClose={onClose} />

      {!!error && (
        <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      <View style={styles.actions}>
        <Button label={busy ? 'Eliminando…' : confirmLabel} icon="delete-outline" variant="danger" onPress={confirm} disabled={busy} />
        <Button label="Cancelar" variant="quiet" onPress={onClose} disabled={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
