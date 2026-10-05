import { StyleSheet, View } from 'react-native';

import { moodColor, moodMeta } from '@/features/closeout/presentation/moodMeta';
import type { Project } from '@/features/projects/domain/project';
import type { Win } from '@/features/wins/domain/win';
import { formatShortDate, formatTime, formatWeekday } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import type { ActivityDay } from '../application/getActivityMap';

type Props = {
  day: ActivityDay;
  wins: Win[];
  projects: Record<string, Project>;
  onViewWeek: () => void;
};

/** What was done on the day picked in the map. */
export function DayDetail({ day, wins, projects, onViewWeek }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Text style={[type.heading, { color: colors.text }]}>
            {formatWeekday(day.date)}, {formatShortDate(day.date)}
            {day.isToday ? ' · Hoy' : ''}
          </Text>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            {day.count} {day.count === 1 ? 'logro' : 'logros'}
          </Text>
        </View>
        {day.mood && (
          <View style={[styles.mood, { backgroundColor: moodColor(colors, day.mood) + '24' }]}>
            <Icon name={moodMeta(day.mood).icon} size={16} color={moodColor(colors, day.mood)} />
            <Text style={[type.caption, { color: colors.text }]}>{moodMeta(day.mood).label}</Text>
          </View>
        )}
      </View>

      {wins.length === 0 ? (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>Nada registrado ese día. Está totalmente bien.</Text>
      ) : (
        <View style={[styles.list, { borderColor: colors.border }]}>
          {wins.map((win, index) => {
            const project = projects[win.projectId];
            return (
              <View key={win.id} style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={[styles.dot, { backgroundColor: project ? colors.projects[project.colorSlot] : colors.textMuted }]} />
                <View style={styles.rowBody}>
                  <Text style={[type.bodySmall, { color: colors.text, fontWeight: win.isMilestone ? '600' : '400' }]}>{win.title}</Text>
                  <Text style={[type.caption, { color: colors.textMuted }]}>
                    {project?.name ?? 'Sin proyecto'} · {formatTime(win.achievedAt)}
                  </Text>
                </View>
                {win.isMilestone && <Icon name="star" size={16} color={colors.accent} />}
              </View>
            );
          })}
        </View>
      )}

      <Button label="Ver esa semana" icon="calendar-week" variant="secondary" onPress={onViewWeek} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  title: { flex: 1, gap: 2 },
  mood: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.full },
  list: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  dot: { width: 10, height: 10, borderRadius: radius.full },
  rowBody: { flex: 1, gap: 2 },
});
