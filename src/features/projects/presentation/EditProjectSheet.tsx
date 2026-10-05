import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { messageOf } from '@/shared/lib/messageOf';
import { spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import type { ProjectOverview } from '../application/getProjectsOverview';
import { MAX_PROJECT_NAME_LENGTH } from '../domain/project';

type Props = {
  visible: boolean;
  overview?: ProjectOverview;
  onClose: () => void;
  onSave: (values: { name: string; description: string; githubRepo: string }) => Promise<void>;
  onToggleArchived: () => Promise<void>;
  /** The caller asks for confirmation before deleting. */
  onDelete: () => void;
};

export function EditProjectSheet({ visible, overview, ...rest }: Props) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      {overview && <Form overview={overview} {...rest} />}
    </Sheet>
  );
}

function Form({ overview, onClose, onSave, onToggleArchived, onDelete }: Omit<Props, 'visible' | 'overview'> & { overview: ProjectOverview }) {
  const { colors } = useTheme();
  const { project, archived } = overview;
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [githubRepo, setGithubRepo] = useState(project.githubRepo ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  };

  return (
    <View style={styles.form}>
      <SheetHeader
        title="Editar proyecto"
        description={archived ? 'Este proyecto está finalizado.' : undefined}
        onClose={onClose}
      />

      <TextField label="Nombre" value={name} onChangeText={setName} maxLength={MAX_PROJECT_NAME_LENGTH} />
      <TextField label="Descripción (opcional)" value={description} onChangeText={setDescription} />
      <View style={styles.repo}>
        <TextField
          label="Repositorio de GitHub (opcional)"
          icon="github"
          value={githubRepo}
          onChangeText={setGithubRepo}
          placeholder="dueño/nombre"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={[type.caption, { color: colors.textMuted }]}>
          Al vincularlo verás sus issues y PRs abiertos en el detalle del proyecto.
        </Text>
      </View>

      {!!error && (
        <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      <Button
        label="Guardar cambios"
        icon="check"
        onPress={() => run(() => onSave({ name, description, githubRepo }))}
        disabled={busy || name.trim() === ''}
        block
      />

      <View style={styles.secondary}>
        <Button
          label={archived ? 'Reactivar proyecto' : 'Marcar como finalizado'}
          icon={archived ? 'restore' : 'check-circle-outline'}
          variant="secondary"
          onPress={() => run(onToggleArchived)}
          disabled={busy}
        />
        <Button label="Eliminar proyecto" icon="delete-outline" variant="danger" onPress={onDelete} disabled={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  repo: { gap: spacing.sm },
  secondary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
