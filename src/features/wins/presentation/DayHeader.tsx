import { StyleSheet, View } from 'react-native';

import type { Mood } from '@/features/closeout/domain/dayClosure';
import { moodColor, moodMeta } from '@/features/closeout/presentation/moodMeta';
import { formatShortDate, formatWeekday } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

type Props = {
  date: Date;
  count: number;
  mood?: Mood;
  isToday: boolean;
};

export function DayHeader({ date, count, mood, isToday }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[type.heading, { color: colors.text }]}>{formatWeekday(date)}</Text>
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>{formatShortDate(date)}</Text>
        {isToday && (
          <View style={[styles.today, { backgroundColor: colors.accentSoft }]}>
            <Text style={[type.caption, { color: colors.accentStrong, fontWeight: '700' }]}>Hoy</Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        {count > 0 && (
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            {count} {count === 1 ? 'logro' : 'logros'}
          </Text>
        )}
        {mood && (
          <View
            style={[styles.mood, { backgroundColor: moodColor(colors, mood) + '24' }]}
            accessibilityLabel={`Ánimo: ${moodMeta(mood).label}`}>
            <Icon name={moodMeta(mood).icon} size={16} color={moodColor(colors, mood)} />
            <Text style={[type.caption, { color: colors.text }]}>{moodMeta(mood).label}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  left: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexShrink: 1, flexWrap: 'wrap' },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  today: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  mood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
});
