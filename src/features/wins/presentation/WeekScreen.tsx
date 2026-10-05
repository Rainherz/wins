import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { formatWeekRange } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { WeekSummary } from '../application/getWeekSummary';
import { DayHeader } from './DayHeader';
import { MomentumCard } from './MomentumCard';
import { WinRow } from './WinRow';

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeekScreen() {
  const { colors, scheme, toggle } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [summary, setSummary] = useState<WeekSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    container.getWeekSummary(weekOffset).then((result) => {
      if (!cancelled) setSummary(result);
    });
    return () => {
      cancelled = true;
    };
  }, [weekOffset]);

  const onToggleMilestone = async (id: string, next: boolean) => {
    await container.toggleMilestone(id, next);
    setSummary(await container.getWeekSummary(weekOffset));
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[type.label, { color: colors.textMuted }]}>
                {summary ? formatWeekRange(summary.weekStart).toUpperCase() : ' '}
              </Text>
              <Text style={[type.display, styles.title, { color: colors.text }]}>
                {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : 'Week'}
              </Text>
            </View>
            <View style={styles.controls}>
              <HeaderButton label="‹" a11y="Previous week" onPress={() => setWeekOffset((o) => o - 1)} />
              <HeaderButton label="›" a11y="Next week" onPress={() => setWeekOffset((o) => Math.min(0, o + 1))} />
              <HeaderButton
                label={scheme === 'light' ? '☾' : '☀'}
                a11y="Toggle theme"
                onPress={toggle}
              />
            </View>
          </View>

          {summary && (
            <>
              <MomentumCard
                total={summary.total}
                projectCount={summary.projectCount}
                previousTotal={summary.previousTotal}
                bars={summary.days.map((day, index) => ({
                  label: WEEKDAY_LETTERS[index],
                  count: day.wins.length,
                  isToday: day.isToday,
                }))}
              />

              <Text style={[type.title, { color: colors.text }]}>What moved forward</Text>

              {summary.days.map((day) => (
                <View key={day.key} style={styles.day}>
                  <DayHeader date={day.date} count={day.wins.length} mood={day.mood} isFuture={day.isFuture} />
                  {day.wins.length === 0 ? (
                    <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[type.bodySmall, { color: colors.textMuted }]}>
                        {day.isFuture ? 'Nothing here yet.' : 'Nothing logged. That is completely okay.'}
                      </Text>
                    </View>
                  ) : (
                    day.wins.map((win) => (
                      <WinRow
                        key={win.id}
                        win={win}
                        project={summary.projects[win.projectId]}
                        onToggleMilestone={() => onToggleMilestone(win.id, !win.isMilestone)}
                      />
                    ))
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeaderButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={{ fontSize: 18, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: 96 },
  content: { width: '100%', maxWidth: 720, padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  titleBlock: { flexShrink: 1, gap: spacing.xs },
  title: { fontSize: 32, lineHeight: 36 },
  controls: { flexDirection: 'row', gap: spacing.sm },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: { gap: spacing.sm },
  empty: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg },
});
