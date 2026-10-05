import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import type { DaySummary } from '@/features/wins/application/getWeekSummary';
import { formatShortDate, formatWeekday } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import type { CloseDayInput } from '../application/closeDay';
import type { Mood } from '../domain/dayClosure';
import { MOODS, moodColor } from './moodMeta';

type Props = {
  visible: boolean;
  today?: DaySummary;
  projects: Record<string, Project>;
  onClose: () => void;
  onAddWin: () => void;
  onSave: (input: CloseDayInput) => Promise<void>;
};

export function CloseOutSheet({ visible, ...rest }: Props) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      {rest.today && <Form {...rest} today={rest.today} />}
    </Sheet>
  );
}

function Form({ today, projects, onClose, onAddWin, onSave }: Omit<Props, 'visible' | 'today'> & { today: DaySummary }) {
  const { colors } = useTheme();
  const [mood, setMood] = useState<Mood | undefined>(today.mood);
  const [note, setNote] = useState(today.stuckNote ?? '');
  const [showNote, setShowNote] = useState(Boolean(today.stuckNote));
  const [saving, setSaving] = useState(false);

  const canSave = mood !== undefined && !saving;

  const save = async () => {
    if (!mood) return;
    setSaving(true);
    await onSave({ mood, stuckNote: note });
  };

  return (
    <View style={styles.form}>
      <SheetHeader
        title="¿Cómo fue hoy?"
        description={`${formatWeekday(today.date)}, ${formatShortDate(today.date)}. No hay respuesta correcta.`}
        onClose={onClose}
      />

      <View style={styles.moods} accessibilityRole="radiogroup">
        {MOODS.map((item) => {
          const selected = item.value === mood;
          return (
            <Pressable
              key={item.value}
              onPress={() => setMood(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ hovered }) => [
                styles.mood,
                {
                  backgroundColor: selected ? colors.accentSoft : hovered ? colors.surfaceMuted : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}>
              <Icon name={item.icon} size={32} color={moodColor(colors, item.value)} />
              <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{item.label}</Text>
              <Text style={[type.caption, { color: colors.textMuted }]}>{item.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.wins, { backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.winsHeader}>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>Logros de hoy</Text>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            {today.wins.length} {today.wins.length === 1 ? 'registrado' : 'registrados'}
          </Text>
        </View>
        {today.wins.length === 0 && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>Aún no hay nada registrado. Está bien.</Text>
        )}
        {today.wins.map((win) => {
          const project = projects[win.projectId];
          return (
            <View key={win.id} style={styles.winRow}>
              <View
                style={[styles.dot, { backgroundColor: project ? colors.projects[project.colorSlot] : colors.textMuted }]}
              />
              <Text style={[type.bodySmall, styles.winTitle, { color: colors.text }]}>{win.title}</Text>
            </View>
          );
        })}
        <Button label="Agregar otro logro" icon="plus" variant="quiet" onPress={onAddWin} flush />
      </View>

      {showNote ? (
        <TextField
          label="¿Qué se trabó?"
          value={note}
          onChangeText={setNote}
          placeholder="Escríbelo, así mañana empiezas de cero…"
          multiline
        />
      ) : (
        <Button label="Agregar una nota sobre lo que se trabó" icon="note-text-outline" variant="quiet" onPress={() => setShowNote(true)} flush />
      )}

      <Button label="Cerrar el día" icon="weather-night" onPress={save} disabled={!canSave} block />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  moods: { flexDirection: 'row', gap: spacing.sm },
  mood: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  wins: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  winsHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  winRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  winTitle: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: radius.full },
});
