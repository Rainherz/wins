import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import { ProjectSelect } from '@/features/projects/presentation/ProjectSelect';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Sheet } from '@/shared/ui/Sheet';
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
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[type.label, { color: colors.textMuted }]}>CAPTURE THE MOMENT</Text>
          <Text style={[type.title, { color: colors.text }]}>Add a win</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
          <Text style={{ fontSize: 22, color: colors.textMuted }}>×</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={[type.bodySmall, styles.fieldLabel, { color: colors.text }]}>What did you finish?</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Even the small things count…"
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          maxLength={MAX_TITLE_LENGTH}
          style={[
            type.body,
            styles.input,
            { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={[type.bodySmall, styles.fieldLabel, { color: colors.text }]}>Project</Text>
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        {projects.length === 0 && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            No projects yet. Create one in the Projects tab first.
          </Text>
        )}
      </View>

      <View style={[styles.milestone, { backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.milestoneText}>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>Mark as a milestone</Text>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>For the wins you&apos;ll want to remember</Text>
        </View>
        <Switch
          value={isMilestone}
          onValueChange={setIsMilestone}
          trackColor={{ true: colors.accent, false: colors.border }}
          accessibilityLabel="Mark as a milestone"
        />
      </View>

      <Pressable
        onPress={save}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        style={[styles.save, { backgroundColor: colors.accent, opacity: canSave ? 1 : 0.4 }]}>
        <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>Save win</Text>
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
  fieldLabel: { fontWeight: '600' },
  input: {
    minHeight: 96,
    textAlignVertical: 'top',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  milestoneText: { flex: 1, gap: 2 },
  save: {
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
