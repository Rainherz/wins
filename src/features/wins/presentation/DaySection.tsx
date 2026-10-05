import { StyleSheet, View } from 'react-native';

import type { Project } from '@/features/projects/domain/project';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import type { DaySummary } from '../application/getWeekSummary';
import type { Win } from '../domain/win';
import { DayHeader } from './DayHeader';
import { WinRow } from './WinRow';

type Props = {
  day: DaySummary;
  projects: Record<string, Project>;
  onToggleMilestone: (id: string, next: boolean) => void;
  onAddWin: () => void;
  onEdit: (win: Win) => void;
};

export function DaySection({ day, projects, onToggleMilestone, onAddWin, onEdit }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <DayHeader date={day.date} count={day.wins.length} mood={day.mood} isToday={day.isToday} />

      {day.wins.length > 0 ? (
        <View style={[styles.group, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
          {day.wins.map((win, index) => (
            <View key={win.id} style={index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }}>
              <WinRow
                win={win}
                project={projects[win.projectId]}
                onToggleMilestone={() => onToggleMilestone(win.id, !win.isMilestone)}
                onEdit={() => onEdit(win)}
              />
            </View>
          ))}
        </View>
      ) : day.isToday ? (
        <View style={[styles.empty, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>Aún no registraste nada hoy.</Text>
          <Button label="Agregar un logro" icon="plus" variant="secondary" onPress={onAddWin} />
        </View>
      ) : (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>Nada registrado. Está totalmente bien.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  group: { borderRadius: radius.lg, overflow: 'hidden' },
  empty: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, alignItems: 'flex-start' },
});
