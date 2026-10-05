import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { Project } from '@/features/projects/domain/project';
import type { Win } from '../domain/win';

type Props = {
  win: Win;
  project?: Project;
  onToggleMilestone: () => void;
};

export function WinRow({ win, project, onToggleMilestone }: Props) {
  const { colors } = useTheme();
  const dotColor = project ? colors.projects[project.colorSlot] : colors.textMuted;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: win.isMilestone ? colors.accentSoft : colors.surface, borderColor: colors.border },
        win.isMilestone && { borderLeftColor: colors.accent, borderLeftWidth: 3 },
      ]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.body}>
        <Text style={[type.body, { color: colors.text }]}>{win.title}</Text>
        <View style={styles.meta}>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>{project?.name ?? 'Sin proyecto'}</Text>
          {win.isMilestone && (
            <View style={[styles.chip, { backgroundColor: colors.accent }]}>
              <Text style={[type.label, { color: colors.onAccent }]}>
                HITO
              </Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        onPress={onToggleMilestone}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={win.isMilestone ? 'Quitar hito' : 'Marcar como hito'}
        style={styles.star}>
        <Text style={{ fontSize: 22, color: win.isMilestone ? colors.accent : colors.textMuted }}>
          {win.isMilestone ? '★' : '☆'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: radius.full },
  body: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  star: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
