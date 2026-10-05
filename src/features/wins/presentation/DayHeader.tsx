import { StyleSheet, Text, View } from 'react-native';

import type { Mood } from '@/features/closeout/domain/dayClosure';
import { moodColor, moodMeta } from '@/features/closeout/presentation/moodMeta';
import { formatShortDate, formatWeekday } from '@/shared/lib/dates';
import { spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';

type Props = {
  date: Date;
  count: number;
  mood?: Mood;
  isFuture: boolean;
};

export function DayHeader({ date, count, mood, isFuture }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[type.body, { color: colors.text }]}>{formatWeekday(date)}</Text>
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>{formatShortDate(date)}</Text>
        {count > 0 && (
          <Text style={[type.bodySmall, { color: colors.accentStrong }]}>
            {count} {count === 1 ? 'win' : 'wins'}
          </Text>
        )}
      </View>
      {isFuture ? (
        <Text style={[type.label, { color: colors.textMuted }]}>Still open</Text>
      ) : (
        mood && (
          <View style={styles.mood} accessibilityLabel={`Mood: ${moodMeta(mood).label}`}>
            <Text style={[type.label, { color: moodColor(colors, mood) }]}>{moodMeta(mood).glyph}</Text>
            <Text style={[type.label, { color: moodColor(colors, mood) }]}>
              {moodMeta(mood).label.toUpperCase()}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  mood: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
