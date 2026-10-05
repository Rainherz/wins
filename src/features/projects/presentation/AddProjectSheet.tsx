import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Sheet } from '@/shared/ui/Sheet';
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

  const inputStyle = [type.body, styles.input, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }];

  return (
    <View style={styles.form}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[type.label, { color: colors.textMuted }]}>NUEVO PROYECTO</Text>
          <Text style={[type.title, { color: colors.text }]}>Agregar un proyecto</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
          <Text style={{ fontSize: 22, color: colors.textMuted }}>×</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={[type.bodySmall, styles.label, { color: colors.text }]}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Atlas"
          placeholderTextColor={colors.textMuted}
          autoFocus
          maxLength={MAX_PROJECT_NAME_LENGTH}
          style={inputStyle}
        />
      </View>

      <View style={styles.field}>
        <Text style={[type.bodySmall, styles.label, { color: colors.text }]}>Descripción (opcional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Plataforma del equipo"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
        />
      </View>

      <Text style={[type.bodySmall, { color: colors.textMuted }]}>El color se asigna automáticamente.</Text>

      {error && (
        <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
          {error}
        </Text>
      )}

      <Pressable
        onPress={save}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        style={[styles.save, { backgroundColor: colors.accent, opacity: canSave ? 1 : 0.4 }]}>
        <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>Guardar proyecto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { gap: spacing.xs },
  close: { minWidth: 44, minHeight: 44, alignItems: 'flex-end' },
  field: { gap: spacing.sm },
  label: { fontWeight: '600' },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  save: { minHeight: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
});
