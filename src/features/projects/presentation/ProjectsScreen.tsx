import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { GithubReposSheet } from '@/features/github/presentation/GithubReposSheet';
import { messageOf } from '@/shared/lib/messageOf';
import { useIsTwoColumn, useIsWide } from '@/shared/lib/useIsWide';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet';
import { ErrorNotice } from '@/shared/ui/ErrorNotice';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Segmented } from '@/shared/ui/Segmented';
import { Text } from '@/shared/ui/Text';
import { useCapture } from '@/shell/CaptureProvider';
import type { CreateProjectInput } from '../application/createProject';
import type { ProjectOverview, ProjectsOverview } from '../application/getProjectsOverview';
import { AddProjectSheet } from './AddProjectSheet';
import { EditProjectSheet } from './EditProjectSheet';
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
  const [editing, setEditing] = useState<ProjectOverview | null>(null);
  const [deleting, setDeleting] = useState<ProjectOverview | null>(null);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Tabs stay mounted, so reload on focus and whenever a win is saved elsewhere.
  useFocusEffect(
    useCallback(() => {
      void revision; // a saved win elsewhere changes this value and triggers a reload
      let cancelled = false;
      container
        .getProjectsOverview()
        .then((result) => {
          if (cancelled) return;
          setOverview(result);
          setLoadError(null);
        })
        .catch((error) => {
          if (!cancelled) setLoadError(messageOf(error));
        });
      return () => {
        cancelled = true;
      };
    }, [revision]),
  );

  const reload = async () => {
    try {
      setOverview(await container.getProjectsOverview());
      setLoadError(null);
    } catch (error) {
      setLoadError(messageOf(error));
    }
  };

  const onSaveNew = async (input: CreateProjectInput) => {
    await container.createProject(input);
    await reload();
    setAdding(false);
  };

  const onImported = async () => {
    await reload();
    setImporting(false);
  };

  const onSaveEdit = async (values: { name: string; description: string }) => {
    if (!editing) return;
    await container.updateProject({ id: editing.project.id, ...values });
    await reload();
    setEditing(null);
  };

  const onToggleArchived = async () => {
    if (!editing) return;
    await container.setProjectArchived(editing.project.id, !editing.archived);
    await reload();
    setEditing(null);
  };

  const onConfirmDelete = async () => {
    if (!deleting) return;
    await container.deleteProject(deleting.project.id);
    await reload();
    setDeleting(null);
  };

  const showFilter = overview !== null && (overview.archivedCount > 0 || filter === 'archived');
  const visible = overview?.projects.filter((item) => (filter === 'archived' ? item.archived : !item.archived)) ?? [];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide, twoColumn && styles.contentTwoColumn]}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[type.display, !isWide && styles.displayNarrow, { color: colors.text }]}>Proyectos</Text>
              {overview && (
                <Text style={[type.body, { color: colors.textMuted }]}>
                  {plural(overview.activeCount, 'proyecto activo', 'proyectos activos')} ·{' '}
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

          {!!loadError && <ErrorNotice message={loadError} onRetry={reload} />}

          {showFilter && overview && (
            <Segmented
              accessibilityLabel="Estado de los proyectos"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'active', label: `Activos · ${overview.activeCount}` },
                { value: 'archived', label: `Finalizados · ${overview.archivedCount}` },
              ]}
            />
          )}

          {overview &&
            (visible.length === 0 ? (
              filter === 'archived' ? (
                <Text style={[type.body, { color: colors.textMuted }]}>Aún no has finalizado ningún proyecto.</Text>
              ) : (
                <View style={[styles.empty, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
                    <Icon name="folder-plus-outline" size={28} color={colors.accentStrong} />
                  </View>
                  <Text style={[type.heading, { color: colors.text }]}>
                    {overview.archivedCount > 0 ? 'No tienes proyectos activos' : 'Aún no hay proyectos'}
                  </Text>
                  <Text style={[type.body, styles.emptyText, { color: colors.textMuted }]}>
                    Importa tus repositorios de GitHub o crea uno a mano para empezar a registrar logros.
                  </Text>
                  <View style={styles.emptyActions}>
                    <Button label="Importar de GitHub" icon="github" onPress={() => setImporting(true)} />
                    <Button label="Crear un proyecto" icon="plus" variant="secondary" onPress={() => setAdding(true)} />
                  </View>
                </View>
              )
            ) : (
              <View style={[styles.list, twoColumn && styles.grid]}>
                {visible.map((item) => (
                  <View key={item.project.id} style={twoColumn && styles.gridItem}>
                    <ProjectCard overview={item} onPress={() => setEditing(item)} />
                  </View>
                ))}
              </View>
            ))}

          {!isWide && (
            <Button label="Cerrar sesión" icon="logout" variant="quiet" onPress={() => container.signOut()} block />
          )}
        </View>
      </ScrollView>

      <GithubReposSheet visible={importing} onClose={() => setImporting(false)} onImported={onImported} />
      <AddProjectSheet visible={adding} onClose={() => setAdding(false)} onSave={onSaveNew} />
      <EditProjectSheet
        visible={editing !== null}
        overview={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSave={onSaveEdit}
        onToggleArchived={onToggleArchived}
        onDelete={() => {
          setDeleting(editing);
          setEditing(null);
        }}
      />
      <ConfirmSheet
        visible={deleting !== null}
        title="¿Eliminar este proyecto?"
        description={
          deleting
            ? deleting.totalWins > 0
              ? `Se eliminará «${deleting.project.name}» junto con ${plural(deleting.totalWins, 'logro', 'logros')}. No se puede deshacer.`
              : `Se eliminará «${deleting.project.name}». No se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar proyecto"
        onConfirm={onConfirmDelete}
        onClose={() => setDeleting(null)}
      />
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
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  list: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '49%' },
  empty: { borderRadius: radius.xl, padding: spacing.xxl, gap: spacing.md, alignItems: 'flex-start' },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  emptyText: { maxWidth: 440 },
  emptyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
