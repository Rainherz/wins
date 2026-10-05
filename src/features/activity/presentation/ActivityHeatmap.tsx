import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { formatShortDate, formatWeekday } from '@/shared/lib/dates';
import { type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Text } from '@/shared/ui/Text';
import type { ActivityDay } from '../application/getActivityMap';

const GAP = 3;
const LABEL_WIDTH = 30;
const MIN_CELL = 9;
const MAX_CELL = 22;
const MONTH_ROW = 18;
/** Row index (Monday = 0) to label on the left. Labelling every row would be noise. */
const WEEKDAY_LABELS: Record<number, string> = { 0: 'lun', 2: 'mié', 4: 'vie' };

/** Intensity bucket from 0 (nothing) to 4 (the busiest day of the period). */
export const levelOf = (count: number, max: number) => (count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4)));

type Props = {
  weeks: ActivityDay[][];
  maxDayCount: number;
  selectedKey?: string;
  onSelect: (day: ActivityDay) => void;
};

export function useLevelColors() {
  const { colors } = useTheme();
  return [colors.surfaceMuted, colors.accent + '55', colors.accent + '88', colors.accent + 'BB', colors.accent];
}

/** One column per week, one row per weekday. Darker means more wins that day. */
export function ActivityHeatmap({ weeks, maxDayCount, selectedKey, onSelect }: Props) {
  const { colors } = useTheme();
  const levelColors = useLevelColors();
  const [width, setWidth] = useState(0);
  const scroller = useRef<ScrollView>(null);

  const available = width - LABEL_WIDTH;
  const fitted = Math.floor((available - GAP * (weeks.length - 1)) / weeks.length);
  const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, fitted));
  // Only scroll when the grid really does not fit. A month label can poke a few pixels past the last column.
  const overflows = weeks.length * cell + (weeks.length - 1) * GAP > available;

  // Name a month where it starts, unless the next label would sit right on top of it.
  const monthStarts = weeks
    .map((week, index) => ({ index, month: week[0].date.getMonth() }))
    .filter((item, i, all) => i === 0 || item.month !== all[i - 1].month);
  const labelled = monthStarts.filter((item, i) => i > 0 || !monthStarts[1] || monthStarts[1].index > 2);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.root}>
      <View style={[styles.weekdays, { width: LABEL_WIDTH, paddingTop: MONTH_ROW }]}>
        {Array.from({ length: 7 }, (_, row) => (
          <View key={row} style={{ height: cell + (row < 6 ? GAP : 0), justifyContent: 'center' }}>
            {WEEKDAY_LABELS[row] && <Text style={[type.caption, { color: colors.textMuted }]}>{WEEKDAY_LABELS[row]}</Text>}
          </View>
        ))}
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        scrollEnabled={overflows}
        showsHorizontalScrollIndicator={false}
        // On narrow screens the grid scrolls; start on the most recent weeks.
        onContentSizeChange={() => overflows && scroller.current?.scrollToEnd({ animated: false })}>
        <View>
          <View style={[styles.months, { height: MONTH_ROW }]}>
            {labelled.map((item) => (
              <Text
                key={item.index}
                numberOfLines={1}
                style={[type.caption, styles.month, { color: colors.textMuted, left: item.index * (cell + GAP) }]}>
                {weeks[item.index][0].date.toLocaleDateString('es', { month: 'short' })}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {weeks.map((week, w) => (
              <View key={w} style={styles.column}>
                {week.map((day) => {
                  const selected = day.key === selectedKey;
                  return (
                    <Pressable
                      key={day.key}
                      disabled={day.isFuture}
                      onPress={() => onSelect(day)}
                      accessibilityRole="button"
                      accessibilityLabel={`${formatWeekday(day.date)} ${formatShortDate(day.date)}: ${day.count} ${day.count === 1 ? 'logro' : 'logros'}`}
                      style={({ hovered }) => [
                        {
                          width: cell,
                          height: cell,
                          borderRadius: Math.max(2, Math.round(cell / 5)),
                          backgroundColor: levelColors[levelOf(day.count, maxDayCount)],
                          borderWidth: selected || day.isToday ? 2 : 0,
                          borderColor: selected ? colors.text : colors.accentStrong,
                          opacity: day.isFuture ? 0.3 : hovered ? 0.8 : 1,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** "Menos ▢▢▢▢▢ Más" legend. */
export function HeatmapLegend() {
  const { colors } = useTheme();
  const levelColors = useLevelColors();

  return (
    <View style={styles.legend} accessibilityLabel="Menos logros a más logros por día">
      <Text style={[type.caption, { color: colors.textMuted }]}>Menos</Text>
      {levelColors.map((color, index) => (
        <View key={index} style={[styles.swatch, { backgroundColor: color }]} />
      ))}
      <Text style={[type.caption, { color: colors.textMuted }]}>Más</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row' },
  weekdays: {},
  months: { position: 'relative' },
  month: { position: 'absolute', top: 0, width: 44 },
  grid: { flexDirection: 'row', gap: GAP },
  column: { gap: GAP },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  swatch: { width: 12, height: 12, borderRadius: 3 },
});
