import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import type { CreateProjectInput } from '../application/createProject';
import { MAX_PROJECT_NAME_LENGTH } from '../domain/project';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateProjectInput) => Promise<void>;
};

export function AddProjectSheet({ visible, onClose, onSave }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Form onClose={onClose} onSave={onSave} />
    </Sheet>
  );
}

function Form({ onClose, onSave }: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ name, description });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el proyecto');
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <SheetHeader title="Agregar un proyecto" description="El color se asigna automáticamente." onClose={onClose} />

      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Atlas"
        autoFocus
        maxLength={MAX_PROJECT_NAME_LENGTH}
      />
      <TextField
        label="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Plataforma del equipo"
      />

      {error && (
        <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
          {error}
        </Text>
      )}

      <Button label="Guardar proyecto" icon="check" onPress={save} disabled={!canSave} block />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
});
