import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import { ProjectSelect } from '@/features/projects/presentation/ProjectSelect';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import type { LogWinInput } from '../application/logWin';
import { MAX_TITLE_LENGTH } from '../domain/win';

type Props = {
  visible: boolean;
  projects: Project[];
  onClose: () => void;
  onSave: (input: LogWinInput) => Promise<void>;
};

export function AddWinSheet({ visible, projects, onClose, onSave }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Form projects={projects} onClose={onClose} onSave={onSave} />
    </Sheet>
  );
}

function Form({ projects, onClose, onSave }: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [isMilestone, setIsMilestone] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && projectId !== '' && !saving;

  const save = async () => {
    setSaving(true);
    await onSave({ title, projectId, isMilestone });
  };

  return (
    <View style={styles.form}>
      <SheetHeader title="Agregar un logro" description="Lo que terminaste, por pequeño que sea." onClose={onClose} />

      <TextField
        label="¿Qué terminaste?"
        value={title}
        onChangeText={setTitle}
        placeholder="Hasta lo pequeño cuenta…"
        multiline
        autoFocus
        maxLength={MAX_TITLE_LENGTH}
      />

      <View style={styles.field}>
        <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>Proyecto</Text>
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        {projects.length === 0 && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            Aún no hay proyectos. Crea uno primero en la pestaña Proyectos.
          </Text>
        )}
      </View>

      <View style={[styles.milestone, { backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.milestoneIcon, { backgroundColor: colors.accentSoft }]}>
          <Icon name="star-outline" size={20} color={colors.accentStrong} />
        </View>
        <View style={styles.milestoneText}>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>Marcar como hito</Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>Para los logros que querrás recordar</Text>
        </View>
        <Switch
          value={isMilestone}
          onValueChange={setIsMilestone}
          trackColor={{ true: colors.accent, false: colors.textMuted + '66' }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Marcar como hito"
        />
      </View>

      <Button label="Guardar logro" icon="check" onPress={save} disabled={!canSave} block />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  milestoneIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  milestoneText: { flex: 1, gap: 2 },
});
