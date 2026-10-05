import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import type { CloseDayInput } from '@/features/closeout/application/closeDay';
import { CloseOutSheet } from '@/features/closeout/presentation/CloseOutSheet';
import { GithubImportSheet } from '@/features/github/presentation/GithubImportSheet';
import { addDays, formatWeekRange, weekOffsetOf } from '@/shared/lib/dates';
import { messageOf } from '@/shared/lib/messageOf';
import { useIsTwoColumn, useIsWide } from '@/shared/lib/useIsWide';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { ErrorNotice } from '@/shared/ui/ErrorNotice';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import { useCapture } from '@/shell/CaptureProvider';
import type { WeekSummary } from '../application/getWeekSummary';
import type { Win } from '../domain/win';
import { DaySection } from './DaySection';
import { WinEditorSheets } from './WinEditorSheets';
import { WeekPulse } from './WeekPulse';

const WEEKDAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const SHORT_WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

export function WeekScreen() {
  const { colors, scheme, toggle } = useTheme();
  const isWide = useIsWide();
  const twoColumn = useIsTwoColumn();
  const { openAddWin, revision, savedWeekOffset } = useCapture();

  // After saving a win, show the week it landed in. Until the user navigates again, that wins over their selection.
  const [selection, setSelection] = useState({ offset: 0, revision });
  const weekOffset = selection.revision === revision ? selection.offset : savedWeekOffset;
  const goTo = (offset: number) => setSelection({ offset, revision });

  const [summary, setSummary] = useState<WeekSummary | null>(null);
  const [closing, setClosing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState<Win | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Tabs stay mounted, so reload on focus and whenever a win is saved elsewhere.
  useFocusEffect(
    useCallback(() => {
      void revision; // a saved win elsewhere changes this value and triggers a reload
      let cancelled = false;
      container
        .getWeekSummary(weekOffset)
        .then((result) => {
          if (cancelled) return;
          setSummary(result);
          setLoadError(null);
        })
        .catch((error) => {
          if (!cancelled) setLoadError(messageOf(error));
        });
      return () => {
        cancelled = true;
      };
    }, [weekOffset, revision]),
  );

  const reload = async () => {
    try {
      setSummary(await container.getWeekSummary(weekOffset));
      setLoadError(null);
    } catch (error) {
      setLoadError(messageOf(error));
    }
  };

  const onToggleMilestone = async (id: string, next: boolean) => {
    try {
      await container.toggleMilestone(id, next);
      await reload();
    } catch (error) {
      setNotice(messageOf(error));
    }
  };

  const onCloseDay = async (input: CloseDayInput) => {
    await container.closeDay(input);
    await reload();
    setClosing(false);
  };

  const onImported = async () => {
    await reload();
    setImporting(false);
  };

  const today = summary?.days.find((day) => day.isToday);
  const visibleDays = summary?.days.filter((day) => !day.isFuture).reverse() ?? [];
  const futureDays = summary?.days.filter((day) => day.isFuture) ?? [];

  const pulse = summary && (
    <WeekPulse
      total={summary.total}
      projectCount={summary.projectCount}
      previousTotal={summary.previousTotal}
      days={summary.days.map((day, index) => ({
        letter: WEEKDAY_LETTERS[index],
        count: day.wins.length,
        isToday: day.isToday,
        mood: day.mood,
      }))}
    />
  );

  const actions = summary && (
    <View style={styles.actions}>
      <Button label="Ver actividad" icon="calendar-month-outline" variant="secondary" onPress={() => router.navigate('/activity')} />
      <Button label="Importar logros" icon="github" variant="secondary" onPress={() => setImporting(true)} />
      {today && (
        <Button
          label={today.mood ? 'Editar el cierre del día' : 'Cerrar el día'}
          icon="weather-night"
          variant="secondary"
          onPress={() => setClosing(true)}
        />
      )}
    </View>
  );

  const daysList = summary && (
    <View style={styles.days}>
      {visibleDays.map((day) => (
        <DaySection
          key={day.key}
          day={day}
          projects={summary.projects}
          onToggleMilestone={onToggleMilestone}
          onAddWin={openAddWin}
          onEdit={setEditing}
        />
      ))}

      {futureDays.length > 0 && (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>
          Por venir:{' '}
          {futureDays.map((day) => SHORT_WEEKDAYS[summary.days.indexOf(day)]).join(', ')}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide, twoColumn && styles.contentTwoColumn]}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[type.display, !isWide && styles.displayNarrow, { color: colors.text }]}>
                {weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana pasada' : 'Semana'}
              </Text>
              {summary && (
                <Text style={[type.body, { color: colors.textMuted }]}>{formatWeekRange(summary.weekStart)}</Text>
              )}
            </View>

            <View style={styles.controls}>
              <View style={[styles.stepper, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
                <IconButton icon="chevron-left" accessibilityLabel="Semana anterior" onPress={() => goTo(weekOffset - 1)} />
                <IconButton
                  icon="chevron-right"
                  accessibilityLabel="Semana siguiente"
                  disabled={weekOffset === 0}
                  onPress={() => goTo(Math.min(0, weekOffset + 1))}
                />
              </View>
              {!isWide && (
                <IconButton
                  icon={scheme === 'light' ? 'weather-night' : 'white-balance-sunny'}
                  accessibilityLabel="Cambiar tema"
                  onPress={toggle}
                />
              )}
            </View>
          </View>

          {!!loadError && <ErrorNotice message={loadError} onRetry={reload} />}
          {!!notice && <ErrorNotice message={notice} onDismiss={() => setNotice(null)} />}

          {summary &&
            (twoColumn ? (
              <View style={styles.columns}>
                <View style={styles.sideColumn}>
                  {pulse}
                  {actions}
                </View>
                <View style={styles.mainColumn}>{daysList}</View>
              </View>
            ) : (
              <>
                {pulse}
                {actions}
                {daysList}
              </>
            ))}
        </View>
      </ScrollView>

      <WinEditorSheets
        win={editing}
        projects={
          editing && summary
            ? Object.values(summary.projects).filter((project) => !project.archivedAt || project.id === editing.projectId)
            : []
        }
        onClose={() => setEditing(null)}
        onSaved={async (win, values) => {
          // If the day changed to another week, follow the win there.
          const target = weekOffsetOf(values.achievedAt ?? win.achievedAt, new Date());
          if (target === weekOffset) await reload();
          else goTo(target);
        }}
        onDeleted={reload}
      />
      <CloseOutSheet
        visible={closing}
        today={today}
        projects={summary?.projects ?? {}}
        onClose={() => setClosing(false)}
        onAddWin={() => {
          setClosing(false);
          openAddWin();
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 720, padding: spacing.lg, gap: spacing.xl },
  contentWide: { padding: spacing.xxl },
  contentTwoColumn: { maxWidth: 1360 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  sideColumn: { width: 440, gap: spacing.xl },
  mainColumn: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  titleBlock: { flexShrink: 1, gap: spacing.xs },
  displayNarrow: { fontSize: 34, lineHeight: 38 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepper: { flexDirection: 'row', borderRadius: radius.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  days: { gap: spacing.xl },
});
