import { Linking, Pressable, StyleSheet, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import { formatTime } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
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
    <View style={[styles.row, win.isMilestone && { backgroundColor: colors.accentSoft }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      <View style={styles.body}>
        <Text style={[type.body, { color: colors.text, fontWeight: win.isMilestone ? '600' : '400' }]}>{win.title}</Text>
        <View style={styles.meta}>
          <Text style={[type.caption, { color: colors.textMuted }]}>{project?.name ?? 'Sin proyecto'}</Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>·</Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>{formatTime(win.achievedAt)}</Text>
          {win.externalUrl && (
            <Pressable
              onPress={() => Linking.openURL(win.externalUrl!)}
              accessibilityRole="link"
              accessibilityLabel="Abrir en GitHub"
              hitSlop={8}
              style={styles.source}>
              <Icon name="github" size={14} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <IconButton
        icon={win.isMilestone ? 'star' : 'star-outline'}
        color={win.isMilestone ? colors.accent : colors.textMuted}
        accessibilityLabel={win.isMilestone ? 'Quitar hito' : 'Marcar como hito'}
        onPress={onToggleMilestone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  dot: { width: 10, height: 10, borderRadius: radius.full, marginTop: spacing.md },
  body: { flex: 1, gap: 2, paddingVertical: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  source: { marginLeft: spacing.xs },
});
