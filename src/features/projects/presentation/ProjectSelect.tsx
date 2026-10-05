import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { Project } from '../domain/project';

type Props = {
  projects: Project[];
  value: string;
  onChange: (projectId: string) => void;
};

export function ProjectSelect({ projects, value, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {projects.map((project) => {
        const selected = project.id === value;
        const color = colors.projects[project.colorSlot];
        return (
          <Pressable
            key={project.id}
            onPress={() => onChange(project.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.accentSoft : colors.surface,
                borderColor: selected ? colors.accent : colors.border,
              },
            ]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[type.bodySmall, { color: colors.text, fontWeight: selected ? '600' : '400' }]}>
              {project.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: radius.full },
});
