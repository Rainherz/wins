import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { PendingWorkPanel } from '@/features/github/presentation/PendingWorkPanel';
import { ReadmePanel } from '@/features/github/presentation/ReadmePanel';
import { WinEditorSheets } from '@/features/wins/presentation/WinEditorSheets';
import { WinRow } from '@/features/wins/presentation/WinRow';
import type { Win } from '@/features/wins/domain/win';
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
import type { ProjectDetail } from '../application/getProjectDetail';
import type { Project } from '../domain/project';
import { EditProjectSheet } from './EditProjectSheet';

const PAGE_SIZE = 40;

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const touchedText = (days?: number) =>
  days === undefined ? 'sin logros aún' : days === 0 ? 'activo hoy' : days === 1 ? 'activo ayer' : `activo hace ${days} días`;

const monthLabel = (date: Date) => {
  const label = date.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Wins are already newest first, so consecutive wins of the same month form one group. */
function groupByMonth(wins: Win[]) {
  const groups: { key: string; label: string; wins: Win[] }[] = [];
  for (const win of wins) {
    const key = `${win.achievedAt.getFullYear()}-${win.achievedAt.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last?.key === key) last.wins.push(win);
    else groups.push({ key, label: monthLabel(win.achievedAt), wins: [win] });
  }
  return groups;
}

export function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, scheme, toggle } = useTheme();
  const isWide = useIsWide();
  const twoColumn = useIsTwoColumn();
  const { openAddWin, revision } = useCapture();

  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [editingWin, setEditingWin] = useState<Win | null>(null);
  const [filter, setFilter] = useState<'all' | 'milestones'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchAll = useCallback(() => Promise.all([container.getProjectDetail(id), container.listProjects()]), [id]);

  // Tabs stay mounted, so reload on focus and whenever a win is saved elsewhere.
  useFocusEffect(
    useCallback(() => {
      void revision; // a saved win elsewhere changes this value and triggers a reload
      let cancelled = false;
      fetchAll()
        .then(([loaded, projects]) => {
          if (cancelled) return;
          setDetail(loaded);
          setActiveProjects(projects);
          setLoadError(null);
        })
        .catch((error) => {
          if (!cancelled) setLoadError(messageOf(error));
        });
      return () => {
        cancelled = true;
      };
    }, [fetchAll, revision]),
  );

  const reload = async () => {
    try {
      const [loaded, projects] = await fetchAll();
      setDetail(loaded);
      setActiveProjects(projects);
      setLoadError(null);
    } catch (error) {
      setLoadError(messageOf(error));
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/projects'));

  const onToggleMilestone = async (win: Win) => {
    try {
      await container.toggleMilestone(win.id, !win.isMilestone);
      await reload();
    } catch (error) {
      setNotice(messageOf(error));
    }
  };

  const project = detail?.overview.project;
  const archived = detail?.overview.archived ?? false;

  // A finished project is not in the active list, but its own wins must still be editable.
  const editorProjects =
    project && !activeProjects.some((item) => item.id === project.id) ? [...activeProjects, project] : activeProjects;

  const filtered = detail ? detail.wins.filter((win) => filter === 'all' || win.isMilestone) : [];
  const groups = groupByMonth(filtered.slice(0, visibleCount));
  const accent = project ? colors.projects[project.colorSlot] : colors.border;

  const pending = project?.githubRepo ? (
    <PendingWorkPanel key={project.githubRepo} repo={project.githubRepo} />
  ) : (
    project && (
      <View style={[styles.link, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
        <View style={[styles.linkIcon, { backgroundColor: colors.accentSoft }]}>
          <Icon name="github" size={22} color={colors.accentStrong} />
        </View>
        <Text style={[type.heading, { color: colors.text }]}>Pendientes en GitHub</Text>
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>
          Vincula el repositorio de este proyecto para ver aquí sus issues y PRs abiertos, siempre al día.
        </Text>
        <Button label="Vincular repositorio" icon="link-variant" variant="secondary" onPress={() => setEditingProject(true)} />
      </View>
    )
  );

  const about = project?.githubRepo ? <ReadmePanel key={`readme-${project.githubRepo}`} repo={project.githubRepo} /> : null;

  const timeline = detail && (
    <View style={styles.timeline}>
      <View style={styles.timelineHeader}>
        <Text style={[type.title, { color: colors.text }]}>Historial</Text>
        {detail.wins.length > 0 && (
          <Segmented
            accessibilityLabel="Filtrar logros"
            value={filter}
            onChange={(next) => {
              setFilter(next);
              setVisibleCount(PAGE_SIZE);
            }}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'milestones', label: `Hitos · ${detail.milestoneCount}` },
            ]}
          />
        )}
      </View>

      {detail.wins.length === 0 ? (
        <View style={[styles.emptyTimeline, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>Aún no hay logros en este proyecto.</Text>
          {!archived && <Button label="Agregar un logro" icon="plus" variant="secondary" onPress={openAddWin} />}
        </View>
      ) : filtered.length === 0 ? (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>Todavía no marcaste hitos en este proyecto.</Text>
      ) : (
        <>
          {groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={[type.heading, { color: colors.text }]}>{group.label}</Text>
                <Text style={[type.bodySmall, { color: colors.textMuted }]}>{plural(group.wins.length, 'logro', 'logros')}</Text>
              </View>
              <View style={[styles.groupCard, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
                {group.wins.map((win, index) => (
                  <View key={win.id} style={index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }}>
                    <WinRow
                      win={win}
                      project={project}
                      showDate
                      onToggleMilestone={() => onToggleMilestone(win)}
                      onEdit={() => setEditingWin(win)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
          {filtered.length > visibleCount && (
            <Button
              label={`Mostrar más (${filtered.length - visibleCount})`}
              variant="secondary"
              onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
            />
          )}
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide, twoColumn && styles.contentTwoColumn]}>
          <View style={styles.topBar}>
            <Button label="Proyectos" icon="chevron-left" variant="quiet" onPress={goBack} flush />
            {!isWide && (
              <IconButton
                icon={scheme === 'light' ? 'weather-night' : 'white-balance-sunny'}
                accessibilityLabel="Cambiar tema"
                onPress={toggle}
              />
            )}
          </View>

          {!!loadError && <ErrorNotice message={loadError} onRetry={reload} />}
          {!!notice && <ErrorNotice message={notice} onDismiss={() => setNotice(null)} />}

          {detail && project && (
            <>
              <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                  <Text style={[type.title, { color: colors.onAccent, fontWeight: '700' }]}>
                    {project.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.titleBlock}>
                  <Text style={[type.display, !isWide && styles.displayNarrow, { color: colors.text }]}>{project.name}</Text>
                  {project.description !== '' && (
                    <Text style={[type.body, { color: colors.textMuted }]}>{project.description}</Text>
                  )}
                  <View style={styles.chips}>
                    {!!project.githubRepo && (
                      <Pressable
                        onPress={() => Linking.openURL(`https://github.com/${project.githubRepo}`)}
                        accessibilityRole="link"
                        accessibilityLabel={`Abrir ${project.githubRepo} en GitHub`}
                        style={({ hovered }) => [
                          styles.chip,
                          { backgroundColor: hovered ? colors.surfaceMuted : colors.surface, borderColor: colors.border },
                        ]}>
                        <Icon name="github" size={14} color={colors.textMuted} />
                        <Text style={[type.caption, { color: colors.text }]}>{project.githubRepo}</Text>
                      </Pressable>
                    )}
                    {archived && (
                      <View style={[styles.chip, { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }]}>
                        <Icon name="check-circle-outline" size={14} color={colors.accentStrong} />
                        <Text style={[type.caption, { color: colors.accentStrong, fontWeight: '600' }]}>Finalizado</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Button label="Editar proyecto" icon="pencil-outline" variant="secondary" onPress={() => setEditingProject(true)} />
              </View>

              <Text style={[type.body, { color: colors.textMuted }]}>
                {plural(detail.overview.totalWins, 'logro', 'logros')} · {plural(detail.milestoneCount, 'hito', 'hitos')} ·{' '}
                {touchedText(detail.overview.daysSinceTouched)}
              </Text>

              {twoColumn ? (
                <View style={styles.columns}>
                  {/* With a README, the wide column reads the project and the narrow one tracks it: pending, then history. */}
                  <View style={styles.sideColumn}>
                    {pending}
                    {about ? timeline : null}
                  </View>
                  <View style={styles.mainColumn}>{about ?? timeline}</View>
                </View>
              ) : (
                <>
                  {about}
                  {pending}
                  {timeline}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <EditProjectSheet
        visible={editingProject}
        overview={detail?.overview}
        onClose={() => setEditingProject(false)}
        onSave={async (values) => {
          await container.updateProject({ id, ...values });
          await reload();
          setEditingProject(false);
        }}
        onToggleArchived={async () => {
          await container.setProjectArchived(id, !archived);
          await reload();
          setEditingProject(false);
        }}
        onDelete={() => {
          setEditingProject(false);
          setDeletingProject(true);
        }}
      />

      <ConfirmSheet
        visible={deletingProject}
        title="¿Eliminar este proyecto?"
        description={
          detail && project
            ? detail.overview.totalWins > 0
              ? `Se eliminará «${project.name}» junto con ${plural(detail.overview.totalWins, 'logro', 'logros')}. No se puede deshacer.`
              : `Se eliminará «${project.name}». No se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar proyecto"
        onConfirm={async () => {
          await container.deleteProject(id);
          setDeletingProject(false);
          goBack();
        }}
        onClose={() => setDeletingProject(false)}
      />

      <WinEditorSheets
        win={editingWin}
        projects={editorProjects}
        onClose={() => setEditingWin(null)}
        onSaved={reload}
        onDeleted={reload}
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, minWidth: 220, gap: spacing.sm },
  displayNarrow: { fontSize: 34, lineHeight: 38 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  sideColumn: { width: 440, gap: spacing.xl },
  mainColumn: { flex: 1, minWidth: 0 },
  link: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'flex-start' },
  linkIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  timeline: { gap: spacing.lg },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  emptyTimeline: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, alignItems: 'flex-start' },
  group: { gap: spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  groupCard: { borderRadius: radius.lg, overflow: 'hidden' },
});
