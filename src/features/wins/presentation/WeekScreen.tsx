import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import type { CloseDayInput } from '@/features/closeout/application/closeDay';
import { CloseOutSheet } from '@/features/closeout/presentation/CloseOutSheet';
import { GithubImportSheet } from '@/features/github/presentation/GithubImportSheet';
import { addDays, formatWeekRange } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Fab } from '@/shared/ui/Fab';
import { HeaderButton } from '@/shared/ui/HeaderButton';
import type { WeekSummary } from '../application/getWeekSummary';
import type { LogWinInput } from '../application/logWin';
import { AddWinSheet } from './AddWinSheet';
import { DayHeader } from './DayHeader';
import { MomentumCard } from './MomentumCard';
import { WinRow } from './WinRow';

const WEEKDAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function WeekScreen() {
  const { colors, scheme, toggle } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [summary, setSummary] = useState<WeekSummary | null>(null);
  const [adding, setAdding] = useState(false);
  const [closing, setClosing] = useState(false);
  const [importing, setImporting] = useState(false);

  // Tabs stay mounted, so reload on focus to pick up projects created elsewhere.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      container.getWeekSummary(weekOffset).then((result) => {
        if (!cancelled) setSummary(result);
      });
      return () => {
        cancelled = true;
      };
    }, [weekOffset]),
  );

  const onToggleMilestone = async (id: string, next: boolean) => {
    await container.toggleMilestone(id, next);
    setSummary(await container.getWeekSummary(weekOffset));
  };

  const onSaveWin = async (input: LogWinInput) => {
    await container.logWin(input);
    // A new win always belongs to the current week.
    setWeekOffset(0);
    setSummary(await container.getWeekSummary(0));
    setAdding(false);
  };

  const onCloseDay = async (input: CloseDayInput) => {
    await container.closeDay(input);
    setSummary(await container.getWeekSummary(weekOffset));
    setClosing(false);
  };

  const onImported = async () => {
    setSummary(await container.getWeekSummary(weekOffset));
    setImporting(false);
  };

  const today = summary?.days.find((day) => day.isToday);

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
                {weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana pasada' : 'Semana'}
              </Text>
            </View>
            <View style={styles.controls}>
              <HeaderButton label="‹" accessibilityLabel="Semana anterior" onPress={() => setWeekOffset((o) => o - 1)} />
              <HeaderButton label="›" accessibilityLabel="Semana siguiente" onPress={() => setWeekOffset((o) => Math.min(0, o + 1))} />
              <HeaderButton
                label={scheme === 'light' ? '☾' : '☀'}
                accessibilityLabel="Cambiar tema"
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

              <Text style={[type.title, { color: colors.text }]}>Lo que avanzó</Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => setImporting(true)}
                  accessibilityRole="button"
                  style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>Importar de GitHub</Text>
                </Pressable>
                {today && (
                  <Pressable
                    onPress={() => setClosing(true)}
                    accessibilityRole="button"
                    style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[type.bodySmall, { color: colors.accentStrong, fontWeight: '600' }]}>
                      Cerrar el día →
                    </Text>
                  </Pressable>
                )}
              </View>

              {summary.days.map((day) => (
                <View key={day.key} style={styles.day}>
                  <DayHeader date={day.date} count={day.wins.length} mood={day.mood} isFuture={day.isFuture} />
                  {day.wins.length === 0 ? (
                    <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[type.bodySmall, { color: colors.textMuted }]}>
                        {day.isFuture ? 'Aún no hay nada.' : 'Nada registrado. Está totalmente bien.'}
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

      <Fab onPress={() => setAdding(true)} accessibilityLabel="Agregar un logro" />
      <CloseOutSheet
        visible={closing}
        today={today}
        projects={summary?.projects ?? {}}
        onClose={() => setClosing(false)}
        onAddWin={() => {
          setClosing(false);
          setAdding(true);
        }}
        onSave={onCloseDay}
      />
      {summary && (
        <GithubImportSheet
          visible={importing}
          from={summary.weekStart}
          to={addDays(summary.weekStart, 7)}
          onClose={() => setImporting(false)}
          onImported={onImported}
        />
      )}
      <AddWinSheet
        visible={adding}
        projects={summary ? Object.values(summary.projects) : []}
        onClose={() => setAdding(false)}
        onSave={onSaveWin}
      />
    </SafeAreaView>
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  day: { gap: spacing.sm },
  empty: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg },
});
