import { Linking, Pressable, StyleSheet, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import { formatTime } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import type { Win } from '../domain/win';

type Props = {
  win: Win;
  project?: Project;
  onToggleMilestone: () => void;
  onEdit: () => void;
};

/**
 * The text area opens the editor; the GitHub link and the star are separate siblings.
 * Interactive elements cannot be nested inside a button on the web, so they stay side by side.
 */
export function WinRow({ win, project, onToggleMilestone, onEdit }: Props) {
  const { colors } = useTheme();
  const dotColor = project ? colors.projects[project.colorSlot] : colors.textMuted;

  return (
    <View style={[styles.row, win.isMilestone && { backgroundColor: colors.accentSoft }]}>
      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={`Editar logro: ${win.title}`}
        style={styles.main}>
        {({ hovered }) => (
          <>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <View style={styles.body}>
              <Text
                style={[
                  type.body,
                  {
                    color: hovered ? colors.accentStrong : colors.text,
                    fontWeight: win.isMilestone ? '600' : '400',
                  },
                ]}>
                {win.title}
              </Text>
              <View style={styles.meta}>
                <Text style={[type.caption, { color: colors.textMuted }]}>{project?.name ?? 'Sin proyecto'}</Text>
                <Text style={[type.caption, { color: colors.textMuted }]}>·</Text>
                <Text style={[type.caption, { color: colors.textMuted }]}>{formatTime(win.achievedAt)}</Text>
              </View>
            </View>
          </>
        )}
      </Pressable>

      {!!win.externalUrl && (
        <IconButton
          icon="github"
          size={18}
          accessibilityLabel="Abrir en GitHub"
          onPress={() => Linking.openURL(win.externalUrl!)}
        />
      )}
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
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: spacing.xs },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
  },
  dot: { width: 10, height: 10, borderRadius: radius.full, marginTop: spacing.md },
  body: { flex: 1, gap: 2, paddingVertical: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
