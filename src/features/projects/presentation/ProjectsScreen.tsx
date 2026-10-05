import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { useIsWide } from '@/shared/lib/useIsWide';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import { useCapture } from '@/shell/CaptureProvider';
import type { CreateProjectInput } from '../application/createProject';
import type { ProjectsOverview } from '../application/getProjectsOverview';
import { AddProjectSheet } from './AddProjectSheet';
import { ProjectCard } from './ProjectCard';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function ProjectsScreen() {
  const { colors, scheme, toggle } = useTheme();
  const isWide = useIsWide();
  const { revision } = useCapture();
  const [overview, setOverview] = useState<ProjectsOverview | null>(null);
  const [adding, setAdding] = useState(false);

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

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide]}>
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
                  Crea uno para empezar a registrar logros, o importa tus PRs desde GitHub en la pantalla Semana y se
                  crearán solos.
                </Text>
                <Button label="Crear un proyecto" icon="plus" onPress={() => setAdding(true)} />
              </View>
            ) : (
              <View style={styles.list}>
                {overview.projects.map((item) => (
                  <ProjectCard key={item.project.id} overview={item} />
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

      <AddProjectSheet visible={adding} onClose={() => setAdding(false)} onSave={onSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 720, padding: spacing.lg, gap: spacing.xl },
  contentWide: { padding: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  titleBlock: { flexShrink: 1, gap: spacing.xs },
  displayNarrow: { fontSize: 34, lineHeight: 38 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  list: { gap: spacing.md },
  empty: { borderRadius: radius.xl, padding: spacing.xxl, gap: spacing.md, alignItems: 'flex-start' },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  emptyText: { maxWidth: 440 },
});
