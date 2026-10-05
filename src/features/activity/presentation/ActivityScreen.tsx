import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { formatShortDate, weekOffsetOf } from '@/shared/lib/dates';
import { messageOf } from '@/shared/lib/messageOf';
import { useIsTwoColumn, useIsWide } from '@/shared/lib/useIsWide';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { ErrorNotice } from '@/shared/ui/ErrorNotice';
import { IconButton } from '@/shared/ui/IconButton';
import { Segmented } from '@/shared/ui/Segmented';
import { Text } from '@/shared/ui/Text';
import { useCapture } from '@/shell/CaptureProvider';
import type { ActivityDay, ActivityMap } from '../application/getActivityMap';
import { ActivityHeatmap, HeatmapLegend } from './ActivityHeatmap';
import { DayDetail } from './DayDetail';
import { EffortList } from './EffortList';

type Range = '13' | '26' | '52';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function ActivityScreen() {
  const { colors, scheme, toggle } = useTheme();
  const isWide = useIsWide();
  const twoColumn = useIsTwoColumn();
  const { revision, showWeek } = useCapture();

  const [range, setRange] = useState<Range>('26');
  const [map, setMap] = useState<ActivityMap | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | undefined>();

  const weekCount = Number(range);

  // Tabs stay mounted, so reload on focus and whenever a win is saved elsewhere.
  useFocusEffect(
    useCallback(() => {
      void revision; // a saved win elsewhere changes this value and triggers a reload
      let cancelled = false;
      container
        .getActivityMap(weekCount)
        .then((result) => {
          if (cancelled) return;
          setMap(result);
          setLoadError(null);
        })
        .catch((error) => {
          if (!cancelled) setLoadError(messageOf(error));
        });
      return () => {
        cancelled = true;
      };
    }, [weekCount, revision]),
  );

  const reload = async () => {
    try {
      setMap(await container.getActivityMap(weekCount));
      setLoadError(null);
    } catch (error) {
      setLoadError(messageOf(error));
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/week'));

  const selected: ActivityDay | undefined = map?.weeks.flat().find((day) => day.key === selectedKey);

  const sentence = !map
    ? ' '
    : map.total === 0
      ? 'Aún no hay logros en este periodo. Tu mapa se irá llenando.'
      : [
          `${plural(map.total, 'logro', 'logros')} en ${weekCount} semanas`,
          `avanzaste en ${plural(map.activeDays, 'día', 'días')}`,
          map.busiestWeek &&
            `tu semana más activa empezó el ${formatShortDate(map.busiestWeek.start)} (${plural(map.busiestWeek.count, 'logro', 'logros')})`,
        ]
          .filter(Boolean)
          .join(' · ');

  const heatmap = map && (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
      <ActivityHeatmap weeks={map.weeks} maxDayCount={map.maxDayCount} selectedKey={selectedKey} onSelect={(day) => setSelectedKey(day.key)} />
      <HeatmapLegend />
    </View>
  );

  const detail = map &&
    (selected ? (
      <DayDetail
        day={selected}
        wins={map.winsByDay[selected.key] ?? []}
        projects={map.projects}
        onViewWeek={() => {
          showWeek(weekOffsetOf(selected.date, new Date()));
          router.navigate('/week');
        }}
      />
    ) : (
      <Text style={[type.bodySmall, { color: colors.textMuted }]}>Toca un día del mapa para ver qué avanzaste.</Text>
    ));

  const effort = map && <EffortList effort={map.effort} />;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide, twoColumn && styles.contentTwoColumn]}>
          <View style={styles.topBar}>
            <Button label="Semana" icon="chevron-left" variant="quiet" onPress={goBack} flush />
            {!isWide && (
              <IconButton
                icon={scheme === 'light' ? 'weather-night' : 'white-balance-sunny'}
                accessibilityLabel="Cambiar tema"
                onPress={toggle}
              />
            )}
          </View>

          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[type.display, !isWide && styles.displayNarrow, { color: colors.text }]}>Actividad</Text>
              <Text style={[type.body, { color: colors.textMuted }]}>{sentence}</Text>
            </View>
            <Segmented
              accessibilityLabel="Periodo"
              value={range}
              onChange={setRange}
              options={[
                { value: '13', label: '3 meses' },
                { value: '26', label: '6 meses' },
                { value: '52', label: '12 meses' },
              ]}
            />
          </View>

          {!!loadError && <ErrorNotice message={loadError} onRetry={reload} />}

          {twoColumn ? (
            <View style={styles.columns}>
              <View style={styles.mainColumn}>
                {heatmap}
                {detail}
              </View>
              <View style={styles.sideColumn}>{effort}</View>
            </View>
          ) : (
            <>
              {heatmap}
              {detail}
              {effort}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 720, padding: spacing.lg, gap: spacing.xl },
  contentWide: { padding: spacing.xxl },
  contentTwoColumn: { maxWidth: 1360 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  titleBlock: { flexShrink: 1, gap: spacing.xs },
  displayNarrow: { fontSize: 34, lineHeight: 38 },
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  mainColumn: { flex: 1, minWidth: 0, gap: spacing.xl },
  sideColumn: { width: 360 },
});
