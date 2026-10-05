import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { Mood } from '@/features/closeout/domain/dayClosure';
import { moodColor, moodMeta } from '@/features/closeout/presentation/moodMeta';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

export type PulseDay = { letter: string; count: number; isToday: boolean; mood?: Mood };

type Props = {
  total: number;
  projectCount: number;
  previousTotal: number;
  days: PulseDay[];
};

const BAR_AREA = 96;

function delta(total: number, previousTotal: number): { icon: IconName; text: string } {
  const diff = total - previousTotal;
  if (diff > 0) return { icon: 'trending-up', text: `${diff} más que la semana pasada` };
  if (diff < 0) return { icon: 'trending-down', text: `${Math.abs(diff)} menos que la semana pasada` };
  return { icon: 'minus', text: 'Igual que la semana pasada' };
}

/** Grows from zero once when it appears: the one authored motion on this screen. */
function Bar({ count, max, isToday }: { count: number; max: number; isToday: boolean }) {
  const { colors } = useTheme();
  const [height] = useState(() => new Animated.Value(0));
  const target = count === 0 ? 0 : Math.max(10, (count / max) * BAR_AREA);

  useEffect(() => {
    Animated.timing(height, {
      toValue: target,
      duration: 650,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [height, target]);

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
      <Animated.View
        style={[styles.fill, { height, backgroundColor: isToday ? colors.accent : colors.accent + 'B8' }]}
      />
    </View>
  );
}

export function WeekPulse({ total, projectCount, previousTotal, days }: Props) {
  const { colors } = useTheme();
  const max = Math.max(1, ...days.map((day) => day.count));
  const change = delta(total, previousTotal);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
      <View style={styles.headline}>
        <Text style={[type.hero, { color: colors.text }]}>
          {total} {total === 1 ? 'logro' : 'logros'}
        </Text>
        <Text style={[type.body, { color: colors.textMuted }]}>
          en {projectCount} {projectCount === 1 ? 'proyecto' : 'proyectos'} esta semana
        </Text>
        <View style={[styles.delta, { backgroundColor: colors.accentSoft }]}>
          <Icon name={change.icon} size={16} color={colors.accentStrong} />
          <Text style={[type.caption, { color: colors.accentStrong, fontWeight: '600' }]}>{change.text}</Text>
        </View>
      </View>

      <View style={styles.strip}>
        {days.map((day, index) => (
          <View key={index} style={styles.column}>
            <Text style={[type.caption, { color: day.count > 0 ? colors.text : colors.textMuted }]}>{day.count > 0 ? day.count : '–'}</Text>
            <Bar count={day.count} max={max} isToday={day.isToday} />
            <Text
              style={[
                type.caption,
                { color: day.isToday ? colors.accentStrong : colors.textMuted, fontWeight: day.isToday ? '700' : '500' },
              ]}>
              {day.letter}
            </Text>
            <View style={styles.moodSlot} accessibilityLabel={day.mood ? `Ánimo: ${moodMeta(day.mood).label}` : undefined}>
              {day.mood && <Icon name={moodMeta(day.mood).icon} size={16} color={moodColor(colors, day.mood)} />}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xl },
  headline: { gap: spacing.xs, alignItems: 'flex-start' },
  delta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  strip: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, alignItems: 'center', gap: spacing.sm },
  track: { width: 28, height: BAR_AREA, borderRadius: radius.md, justifyContent: 'flex-end', overflow: 'hidden' },
  fill: { width: '100%', borderRadius: radius.md },
  moodSlot: { height: 16, alignItems: 'center', justifyContent: 'center' },
});
