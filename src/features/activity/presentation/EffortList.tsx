import { StyleSheet, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Text } from '@/shared/ui/Text';
import type { ProjectEffort } from '../application/getActivityMap';

const VISIBLE = 6;

/** Wins per project over the period, as bars scaled to the busiest project. */
export function EffortList({ effort }: { effort: ProjectEffort[] }) {
  const { colors } = useTheme();
  const shown = effort.slice(0, VISIBLE);
  const rest = effort.slice(VISIBLE).reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(1, ...effort.map((item) => item.count));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
      <View style={styles.title}>
        <Text style={[type.heading, { color: colors.text }]}>Dónde pusiste el esfuerzo</Text>
        <Text style={[type.caption, { color: colors.textMuted }]}>Logros por proyecto en este periodo</Text>
      </View>

      {shown.length === 0 ? (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>Aún no hay logros en este periodo.</Text>
      ) : (
        <View style={styles.rows}>
          {shown.map((item) => {
            const color = item.project ? colors.projects[item.project.colorSlot] : colors.textMuted;
            return (
              <View key={item.projectId} style={styles.item}>
                <View style={styles.line}>
                  <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]} numberOfLines={1}>
                    {item.project?.name ?? 'Sin proyecto'}
                  </Text>
                  <Text style={[type.bodySmall, { color: colors.textMuted }]}>{item.count}</Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                  <View style={[styles.fill, { backgroundColor: color, width: `${Math.max(4, (item.count / max) * 100)}%` }]} />
                </View>
              </View>
            );
          })}
          {rest > 0 && <Text style={[type.caption, { color: colors.textMuted }]}>Y {rest} más en otros proyectos.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  title: { gap: 2 },
  rows: { gap: spacing.md },
  item: { gap: spacing.xs },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
});
