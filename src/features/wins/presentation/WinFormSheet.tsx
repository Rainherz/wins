import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import { ProjectSelect } from '@/features/projects/presentation/ProjectSelect';
import { atNoon, atTimeOf, dayKey, formatDayChip, isSameDay, lastDays, startOfDay } from '@/shared/lib/dates';
import { messageOf } from '@/shared/lib/messageOf';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { ChipSelect } from '@/shared/ui/ChipSelect';
import { Icon } from '@/shared/ui/Icon';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import { MAX_TITLE_LENGTH, type Win } from '../domain/win';

export type WinFormValues = {
  title: string;
  projectId: string;
  isMilestone: boolean;
  /** Only set when the day was changed. Otherwise the existing date (or "now") is kept. */
  achievedAt?: Date;
};

type Props = {
  visible: boolean;
  projects: Project[];
  /** Present when editing an existing win. */
  win?: Win;
  onClose: () => void;
  onSave: (values: WinFormValues) => Promise<void>;
  /** Edit mode only. The caller asks for confirmation. */
  onDelete?: () => void;
};

const RECENT_DAYS = 7;

export function WinFormSheet({ visible, ...rest }: Props) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      <Form {...rest} />
    </Sheet>
  );
}

function Form({ projects, win, onClose, onSave, onDelete }: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const editing = win !== undefined;

  const [now] = useState(() => new Date());
  const [title, setTitle] = useState(win?.title ?? '');
  const [projectId, setProjectId] = useState(win?.projectId ?? projects[0]?.id ?? '');
  const [isMilestone, setIsMilestone] = useState(win?.isMilestone ?? false);
  const [day, setDay] = useState(() => startOfDay(win?.achievedAt ?? now));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The last week, plus the win's own day when it is older than that.
  const days = lastDays(now, RECENT_DAYS);
  if (win && !days.some((candidate) => isSameDay(candidate, win.achievedAt))) days.push(startOfDay(win.achievedAt));

  const canSave = title.trim().length > 0 && projectId !== '' && !saving;

  /** The date to send: only when the day actually changed. */
  const pickedAt = () => {
    if (win) return isSameDay(day, win.achievedAt) ? undefined : atTimeOf(day, win.achievedAt);
    return isSameDay(day, now) ? undefined : atNoon(day);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ title, projectId, isMilestone, achievedAt: pickedAt() });
    } catch (err) {
      setError(messageOf(err));
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <SheetHeader
        title={editing ? 'Editar logro' : 'Agregar un logro'}
        description={editing ? 'Cambia lo que necesites.' : 'Lo que terminaste, por pequeño que sea.'}
        onClose={onClose}
      />

      <TextField
        label="¿Qué terminaste?"
        value={title}
        onChangeText={setTitle}
        placeholder="Hasta lo pequeño cuenta…"
        multiline
        autoFocus={!editing}
        maxLength={MAX_TITLE_LENGTH}
      />

      <View style={styles.field}>
        <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>¿Cuándo?</Text>
        <ChipSelect
          accessibilityLabel="Día del logro"
          value={dayKey(day)}
          onChange={(key) => setDay(days.find((candidate) => dayKey(candidate) === key) ?? day)}
          options={days.map((candidate) => ({ value: dayKey(candidate), label: formatDayChip(candidate, now) }))}
        />
      </View>

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

      {!!error && (
        <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      <Button
        label={editing ? 'Guardar cambios' : 'Guardar logro'}
        icon="check"
        onPress={save}
        disabled={!canSave}
        block
      />
      {editing && onDelete && (
        <Button label="Eliminar logro" icon="delete-outline" variant="danger" onPress={onDelete} disabled={saving} block />
      )}
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
