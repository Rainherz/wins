import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';

type Bar = { label: string; count: number; isToday: boolean };

type Props = {
  total: number;
  projectCount: number;
  previousTotal: number;
  bars: Bar[];
};

const BAR_AREA = 72;

function deltaText(total: number, previousTotal: number) {
  const diff = total - previousTotal;
  if (diff > 0) return `${diff} más que la semana pasada.`;
  if (diff < 0) return `${Math.abs(diff)} menos que la semana pasada. Cada semana es distinta.`;
  return 'Igual que la semana pasada.';
}

export function MomentumCard({ total, projectCount, previousTotal, bars }: Props) {
  const { colors } = useTheme();
  const max = Math.max(1, ...bars.map((bar) => bar.count));

  return (
    <View style={[styles.card, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
      <Text style={[type.label, { color: colors.textMuted }]}>TU IMPULSO</Text>
      <Text style={[type.stat, { color: colors.text }]}>
        {total} {total === 1 ? 'logro' : 'logros'}
        <Text style={[type.body, { color: colors.textMuted }]}>
          {' '}
          en {projectCount} {projectCount === 1 ? 'proyecto' : 'proyectos'}
        </Text>
      </Text>
      <Text style={[type.bodySmall, { color: colors.textMuted }]}>{deltaText(total, previousTotal)}</Text>

      <View style={styles.bars}>
        {bars.map((bar, index) => (
          <View key={index} style={styles.barColumn}>
            <Text style={[type.label, { color: colors.textMuted }]}>{bar.count}</Text>
            <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.fill,
                  {
                    height: Math.max(4, (bar.count / max) * BAR_AREA),
                    backgroundColor: bar.isToday ? colors.accent : colors.accent + '80',
                  },
                ]}
              />
            </View>
            <Text style={[type.label, { color: bar.isToday ? colors.accentStrong : colors.textMuted }]}>
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  barColumn: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  track: {
    width: 20,
    height: BAR_AREA,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: { width: '100%', borderRadius: radius.sm },
});
