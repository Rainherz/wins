import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { useIsTwoColumn, useIsWide } from '@/shared/lib/useIsWide';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import { useCapture } from '@/shell/CaptureProvider';
import { GithubReposSheet } from '@/features/github/presentation/GithubReposSheet';
import type { CreateProjectInput } from '../application/createProject';
import type { ProjectsOverview } from '../application/getProjectsOverview';
import { AddProjectSheet } from './AddProjectSheet';
import { ProjectCard } from './ProjectCard';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function ProjectsScreen() {
  const { colors, scheme, toggle } = useTheme();
  const isWide = useIsWide();
  const twoColumn = useIsTwoColumn();
  const { revision } = useCapture();
  const [overview, setOverview] = useState<ProjectsOverview | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  // Tabs stay mounted, so reload on focus and whenever a win is saved elsewhere.
  useFocusEffect(
    useCallback(() => {
      void revision; // a saved win elsewhere changes this value and triggers a reload
      let cancelled = false;
      container.getProjectsOverview().then((result) => {
        if (!cancelled) setOverview(result);
      });
      return () => {
        cancelled = true;
      };
    }, [revision]),
  );

  const onSave = async (input: CreateProjectInput) => {
    await container.createProject(input);
    setOverview(await container.getProjectsOverview());
    setAdding(false);
  };

  const onImported = async () => {
    setOverview(await container.getProjectsOverview());
    setImporting(false);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide, twoColumn && styles.contentTwoColumn]}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[type.display, !isWide && styles.displayNarrow, { color: colors.text }]}>Proyectos</Text>
              {overview && (
                <Text style={[type.body, { color: colors.textMuted }]}>
                  {plural(overview.projects.length, 'proyecto', 'proyectos')} ·{' '}
                  {plural(overview.winsThisWeek, 'logro', 'logros')} esta semana · {overview.totalWins} en total
                </Text>
              )}
            </View>
            <View style={styles.controls}>
              <Button label="Importar de GitHub" icon="github" variant="secondary" onPress={() => setImporting(true)} />
              <Button label="Nuevo proyecto" icon="plus" variant="secondary" onPress={() => setAdding(true)} />
              {!isWide && (
                <IconButton
                  icon={scheme === 'light' ? 'weather-night' : 'white-balance-sunny'}
                  accessibilityLabel="Cambiar tema"
                  onPress={toggle}
                />
              )}
            </View>
          </View>

          {overview &&
            (overview.projects.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
                  <Icon name="folder-plus-outline" size={28} color={colors.accentStrong} />
                </View>
                <Text style={[type.heading, { color: colors.text }]}>Aún no hay proyectos</Text>
                <Text style={[type.body, styles.emptyText, { color: colors.textMuted }]}>
                  Importa tus repositorios de GitHub o crea uno a mano para empezar a registrar logros.
                </Text>
                <View style={styles.emptyActions}>
                  <Button label="Importar de GitHub" icon="github" onPress={() => setImporting(true)} />
                  <Button label="Crear un proyecto" icon="plus" variant="secondary" onPress={() => setAdding(true)} />
                </View>
              </View>
            ) : (
              <View style={[styles.list, twoColumn && styles.grid]}>
                {overview.projects.map((item) => (
                  <View key={item.project.id} style={twoColumn && styles.gridItem}>
                    <ProjectCard overview={item} />
                  </View>
                ))}
              </View>
            ))}

          {!isWide && (
            <Button
              label="Cerrar sesión"
              icon="logout"
              variant="quiet"
              onPress={() => container.signOut()}
              block
            />
          )}
        </View>
      </ScrollView>

      <GithubReposSheet visible={importing} onClose={() => setImporting(false)} onImported={onImported} />
      <AddProjectSheet visible={adding} onClose={() => setAdding(false)} onSave={onSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 720, padding: spacing.lg, gap: spacing.xl },
  contentWide: { padding: spacing.xxl },
  contentTwoColumn: { maxWidth: 1360 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  titleBlock: { flexShrink: 1, gap: spacing.xs },
  displayNarrow: { fontSize: 34, lineHeight: 38 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  list: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '49%' },
  empty: { borderRadius: radius.xl, padding: spacing.xxl, gap: spacing.md, alignItems: 'flex-start' },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  emptyText: { maxWidth: 440 },
  emptyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
