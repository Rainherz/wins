import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { ProjectOverview } from '../application/getProjectsOverview';

const BAR_AREA = 28;

function lastTouchedText(days?: number) {
  if (days === undefined) return 'sin logros aún';
  if (days === 0) return 'última actividad hoy';
  if (days === 1) return 'última actividad ayer';
  return `última actividad hace ${days} días`;
}

export function ProjectCard({ overview }: { overview: ProjectOverview }) {
  const { colors } = useTheme();
  const { project, winsThisWeek, last7Days, daysSinceTouched } = overview;
  const color = colors.projects[project.colorSlot];
  const max = Math.max(1, ...last7Days);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={[type.body, { color: colors.onAccent, fontWeight: '700' }]}>
          {project.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[type.body, { color: colors.text }]} numberOfLines={1}>
          {project.name}
        </Text>
        {project.description !== '' && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]} numberOfLines={1}>
            {project.description}
          </Text>
        )}
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>{lastTouchedText(daysSinceTouched)}</Text>
      </View>

      <View style={styles.stats}>
        <Text style={[type.stat, { color: colors.text }]}>{winsThisWeek}</Text>
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>logros esta semana</Text>
        <View style={styles.bars} accessibilityLabel="Logros de los últimos 7 días">
          {last7Days.map((count, index) => (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: count === 0 ? 3 : Math.max(6, (count / max) * BAR_AREA),
                  backgroundColor: count === 0 ? colors.border : color,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  avatar: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  stats: { alignItems: 'flex-end', gap: 2 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: BAR_AREA, marginTop: spacing.xs },
  bar: { width: 5, borderRadius: 2 },
});
