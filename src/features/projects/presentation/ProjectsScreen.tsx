import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { HeaderButton } from '@/shared/ui/HeaderButton';
import type { CreateProjectInput } from '../application/createProject';
import type { ProjectsOverview } from '../application/getProjectsOverview';
import { AddProjectSheet } from './AddProjectSheet';
import { ProjectCard } from './ProjectCard';

export function ProjectsScreen() {
  const { colors, scheme, toggle } = useTheme();
  const [overview, setOverview] = useState<ProjectsOverview | null>(null);
  const [adding, setAdding] = useState(false);

  // Tabs stay mounted, so reload every time this screen regains focus.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      container.getProjectsOverview().then((result) => {
        if (!cancelled) setOverview(result);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const onSave = async (input: CreateProjectInput) => {
    await container.createProject(input);
    setOverview(await container.getProjectsOverview());
    setAdding(false);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[type.label, { color: colors.textMuted }]}>TU TRABAJO, EN CONTEXTO</Text>
              <Text style={[type.display, styles.title, { color: colors.text }]}>Proyectos</Text>
            </View>
            <HeaderButton
              label={scheme === 'light' ? '☾' : '☀'}
              accessibilityLabel="Cambiar tema"
              onPress={toggle}
            />
          </View>

          {overview && (
            <>
              <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Stat value={overview.projects.length} label="proyectos activos" />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Stat value={overview.winsThisWeek} label="logros esta semana" />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Stat value={overview.totalWins} label="logros en total" />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[type.title, styles.sectionTitle, { color: colors.text }]}>Donde estás avanzando</Text>
                <Pressable
                  onPress={() => setAdding(true)}
                  accessibilityRole="button"
                  style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>+ Agregar proyecto</Text>
                </Pressable>
              </View>

              {overview.projects.length === 0 ? (
                <Text style={[type.body, { color: colors.textMuted }]}>
                  Aún no hay proyectos. Agrega uno para empezar a registrar logros.
                </Text>
              ) : (
                overview.projects.map((item) => <ProjectCard key={item.project.id} overview={item} />)
              )}
            </>
          )}

          <Pressable onPress={() => container.signOut()} accessibilityRole="button" style={styles.signOut}>
            <Text style={[type.bodySmall, { color: colors.textMuted }]}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddProjectSheet visible={adding} onClose={() => setAdding(false)} onSave={onSave} />
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[type.stat, { color: colors.text }]}>{value}</Text>
      <Text style={[type.bodySmall, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: spacing.xxl },
  content: { width: '100%', maxWidth: 720, padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  titleBlock: { flexShrink: 1, gap: spacing.xs },
  title: { fontSize: 32, lineHeight: 36 },
  stats: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, paddingVertical: spacing.lg },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  divider: { width: 1 },
  signOut: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { flexShrink: 1 },
  addButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
