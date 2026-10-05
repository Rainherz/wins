import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import type { DaySummary } from '@/features/wins/application/getWeekSummary';
import { formatShortDate, formatWeekday } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Sheet } from '@/shared/ui/Sheet';
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
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[type.label, { color: colors.textMuted }]}>
            {`${formatWeekday(today.date)}, ${formatShortDate(today.date)}`.toUpperCase()}
          </Text>
          <Text style={[type.title, { color: colors.text }]}>¿Cómo fue hoy?</Text>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>No hay respuesta correcta. Solo observa cómo se sintió.</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
          <Text style={{ fontSize: 22, color: colors.textMuted }}>×</Text>
        </Pressable>
      </View>

      <View style={styles.moods} accessibilityRole="radiogroup">
        {MOODS.map((item) => {
          const selected = item.value === mood;
          const color = moodColor(colors, item.value);
          return (
            <Pressable
              key={item.value}
              onPress={() => setMood(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.mood,
                {
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}>
              <Text style={[type.title, { color }]}>{item.glyph}</Text>
              <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.wins, { backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.winsHeader}>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>Logros de hoy</Text>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>{today.wins.length} {today.wins.length === 1 ? 'registrado' : 'registrados'}</Text>
        </View>
        {today.wins.length === 0 && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>Aún no hay nada registrado. Está bien.</Text>
        )}
        {today.wins.map((win) => {
          const project = projects[win.projectId];
          return (
            <View key={win.id} style={styles.winRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: project ? colors.projects[project.colorSlot] : colors.textMuted },
                ]}
              />
              <Text style={[type.bodySmall, styles.winTitle, { color: colors.text }]}>{win.title}</Text>
            </View>
          );
        })}
        <Pressable onPress={onAddWin} accessibilityRole="button" style={styles.link}>
          <Text style={[type.bodySmall, { color: colors.accentStrong, fontWeight: '600' }]}>+ Agregar otro logro</Text>
        </Pressable>
      </View>

      {showNote ? (
        <View style={styles.field}>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>¿Qué se trabó?</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Escríbelo, así mañana empiezas de cero…"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[
              type.body,
              styles.input,
              { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          />
        </View>
      ) : (
        <Pressable onPress={() => setShowNote(true)} accessibilityRole="button" style={styles.link}>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>+ Agregar una nota opcional sobre lo que se trabó</Text>
        </Pressable>
      )}

      <Pressable
        onPress={save}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        style={[styles.save, { backgroundColor: colors.accent, opacity: canSave ? 1 : 0.4 }]}>
        <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>Cerrar el día</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { flex: 1, gap: spacing.xs },
  close: { minWidth: 44, minHeight: 44, alignItems: 'flex-end' },
  moods: { flexDirection: 'row', gap: spacing.sm },
  mood: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  wins: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  winsHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  winRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  winTitle: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: radius.full },
  link: { minHeight: 44, justifyContent: 'center' },
  field: { gap: spacing.sm },
  input: {
    minHeight: 80,
    textAlignVertical: 'top',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  save: { minHeight: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
});
