import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import type { ProjectOverview } from '../application/getProjectsOverview';

const BAR_AREA = 32;

function lastTouchedText(days?: number) {
  if (days === undefined) return 'Sin logros aún';
  if (days === 0) return 'Activo hoy';
  if (days === 1) return 'Activo ayer';
  return `Activo hace ${days} días`;
}

type Props = {
  overview: ProjectOverview;
  onPress: () => void;
};

export function ProjectCard({ overview, onPress }: Props) {
  const { colors } = useTheme();
  const { project, winsThisWeek, last7Days, daysSinceTouched, archived } = overview;
  const color = colors.projects[project.colorSlot];
  const max = Math.max(1, ...last7Days);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Editar proyecto ${project.name}`}
      style={({ hovered }) => [
        styles.card,
        {
          backgroundColor: hovered ? colors.surfaceMuted : colors.surface,
          boxShadow: colors.shadowCard,
          opacity: archived ? 0.75 : 1,
        },
      ]}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={[type.bodySmall, { color: colors.onAccent, fontWeight: '700' }]}>
          {project.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[type.heading, { color: colors.text }]} numberOfLines={1}>
          {project.name}
        </Text>
        {project.description !== '' && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]} numberOfLines={1}>
            {project.description}
          </Text>
        )}
        <View style={styles.touched}>
          <Icon name={archived ? 'check-circle-outline' : 'clock-outline'} size={14} color={colors.textMuted} />
          <Text style={[type.caption, { color: colors.textMuted }]}>
            {archived ? 'Finalizado' : lastTouchedText(daysSinceTouched)}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={[type.hero, styles.count, { color: colors.text }]}>{winsThisWeek}</Text>
        <Text style={[type.caption, { color: colors.textMuted }]}>esta semana</Text>
        <View style={styles.bars} accessibilityLabel="Logros de los últimos 7 días">
          {last7Days.map((count, index) => (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: count === 0 ? 3 : Math.max(8, (count / max) * BAR_AREA),
                  backgroundColor: count === 0 ? colors.border : color,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  avatar: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  touched: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  stats: { alignItems: 'flex-end', gap: 2 },
  count: { fontSize: 30, lineHeight: 32 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: BAR_AREA, marginTop: spacing.sm },
  bar: { width: 5, borderRadius: 2 },
});
