import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { container } from '@/composition/container';
import { formatShortDate } from '@/shared/lib/dates';
import { messageOf } from '@/shared/lib/messageOf';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { Segmented } from '@/shared/ui/Segmented';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import { InvalidGithubTokenError } from '../application/connectGithub';
import { GithubNotConnectedError } from '../application/getImportSuggestions';
import type { RepoSuggestion } from '../application/getRepoSuggestions';
import { GithubConnectPanel } from './GithubConnectPanel';

type Props = {
  visible: boolean;
  onClose: () => void;
  onImported: () => Promise<void>;
};

type Phase =
  | { kind: 'loading' }
  | { kind: 'connect'; notice?: string }
  | { kind: 'ready'; login: string; repos: RepoSuggestion[] }
  | { kind: 'error'; message: string };

async function fetchPhase(): Promise<Phase> {
  try {
    const { login, repos } = await container.getRepoSuggestions();
    return { kind: 'ready', login, repos };
  } catch (error) {
    if (error instanceof GithubNotConnectedError) return { kind: 'connect' };
    if (error instanceof InvalidGithubTokenError) return { kind: 'connect', notice: 'El token guardado ya no es válido (puede que lo hayas revocado o que haya expirado). Pega uno nuevo.' };
    return { kind: 'error', message: messageOf(error) };
  }
}

export function GithubReposSheet({ visible, ...rest }: Props) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      <Form {...rest} />
    </Sheet>
  );
}

function Tag({ icon, label }: { icon: IconName; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.tag}>
      <Icon name={icon} size={14} color={colors.textMuted} />
      <Text style={[type.caption, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function Form({ onClose, onImported }: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState<string | null>(null);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPhase().then((next) => {
      if (!cancelled) setPhase(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = async () => {
    setPhase({ kind: 'loading' });
    setSelected(new Set());
    setPhase(await fetchPhase());
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await container.disconnectGithub();
      setSelected(new Set());
      setPhase({ kind: 'connect' });
    } catch (error) {
      setActionError(messageOf(error));
    } finally {
      setBusy(false);
    }
  };

  const importSelected = async () => {
    if (phase.kind !== 'ready') return;
    setBusy(true);
    setActionError(null);
    try {
      await container.importRepos(phase.repos.filter((repo) => selected.has(repo.fullName)));
      await onImported();
    } catch (error) {
      setActionError(messageOf(error));
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const matchesVisibility = (repo: RepoSuggestion) =>
    visibility === 'all' || (visibility === 'private' ? repo.isPrivate : !repo.isPrivate);

  // Repositories per owner (under the visibility filter): shows which owners the token can reach.
  const byVisibility = phase.kind === 'ready' ? phase.repos.filter(matchesVisibility) : [];
  const owners = [
    ...byVisibility.reduce((counts, repo) => counts.set(repo.owner, (counts.get(repo.owner) ?? 0) + 1), new Map<string, number>()),
  ].sort((x, y) => y[1] - x[1]);

  const visibleRepos = byVisibility.filter(
    (repo) =>
      (owner === null || repo.owner === owner) && repo.fullName.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selectable = visibleRepos.filter((repo) => !repo.alreadyProject);
  const allSelected = selectable.length > 0 && selectable.every((repo) => selected.has(repo.fullName));

  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      for (const repo of selectable) {
        if (allSelected) next.delete(repo.fullName);
        else next.add(repo.fullName);
      }
      return next;
    });

  const description =
    phase.kind === 'ready'
      ? `Conectado como @${phase.login}. Elige qué repositorios quieres tener como proyectos.`
      : 'Trae tus repositorios de GitHub como proyectos de Wins.';

  return (
    <View style={styles.form}>
      <SheetHeader title="Importar proyectos de GitHub" description={description} onClose={onClose} />

      {phase.kind === 'loading' && (
        <Text style={[type.body, { color: colors.textMuted }]}>Buscando tus repositorios…</Text>
      )}

      {phase.kind === 'error' && (
        <>
          <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
            {phase.message}
          </Text>
          <Button label="Reintentar" icon="refresh" onPress={reload} />
        </>
      )}

      {phase.kind === 'connect' && <GithubConnectPanel onConnected={reload} notice={phase.notice} />}

      {phase.kind === 'ready' && (
        <>
          {phase.repos.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceMuted }]}>
              <Icon name="source-repository" size={24} color={colors.textMuted} />
              <Text style={[type.body, { color: colors.textMuted }]}>
                El token no tiene acceso a ningún repositorio. Edítalo en GitHub y agrega los que quieras importar.
              </Text>
            </View>
          ) : (
            <>
              {!phase.repos.some((repo) => repo.isPrivate) && (
                <View style={[styles.callout, { backgroundColor: colors.accentSoft }]}>
                  <Icon name="lock-alert-outline" size={20} color={colors.accentStrong} />
                  <View style={styles.calloutText}>
                    <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>
                      Este token no ve ningún repositorio privado
                    </Text>
                    <Text style={[type.caption, { color: colors.text }]}>
                      En GitHub revisa que el dueño del token sea tu cuenta, que el acceso sea «All repositories» y que
                      tenga al menos un permiso de repositorio de solo lectura (por ejemplo Issues y Pull requests).
                      Luego pulsa «Desconectar GitHub» y pega el token otra vez.
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.browser}>
              <View style={styles.filters}>
                <TextField
                  icon="magnify"
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar repositorio…"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={styles.filterRow}>
                  <Segmented
                    accessibilityLabel="Visibilidad"
                    value={visibility}
                    onChange={setVisibility}
                    options={[
                      { value: 'all', label: 'Todos' },
                      { value: 'public', label: 'Públicos' },
                      { value: 'private', label: 'Privados' },
                    ]}
                  />
                  {owners.length > 1 && (
                    <Button
                      label={`Dueño: ${owner ?? 'todos'}`}
                      icon={ownerOpen ? 'chevron-up' : 'chevron-down'}
                      iconPosition="end"
                      variant="secondary"
                      onPress={() => setOwnerOpen((open) => !open)}
                    />
                  )}
                </View>

                {ownerOpen && (
                  <View style={[styles.ownerList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ScrollView nestedScrollEnabled style={styles.ownerScroll}>
                      {[{ key: null, label: 'Todos los dueños', count: byVisibility.length }, ...owners.map(([name, count]) => ({ key: name, label: name, count }))].map(
                        (item) => {
                          const active = owner === item.key;
                          return (
                            <Pressable
                              key={item.key ?? 'all'}
                              onPress={() => {
                                setOwner(item.key);
                                setOwnerOpen(false);
                              }}
                              accessibilityRole="radio"
                              accessibilityState={{ selected: active }}
                              style={({ hovered }) => [
                                styles.ownerRow,
                                { backgroundColor: active ? colors.accentSoft : hovered ? colors.surfaceMuted : 'transparent' },
                              ]}>
                              <Text style={[type.bodySmall, { color: colors.text, fontWeight: active ? '600' : '400' }]}>
                                {item.label}
                              </Text>
                              <Text style={[type.caption, { color: colors.textMuted }]}>{item.count}</Text>
                            </Pressable>
                          );
                        },
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.results}>
              <View style={styles.listHeader}>
                <Text style={[type.bodySmall, { color: colors.textMuted }]}>
                  {visibleRepos.length} {visibleRepos.length === 1 ? 'repositorio' : 'repositorios'}
                </Text>
                {selectable.length > 0 && (
                  <Button
                    label={allSelected ? 'Quitar selección' : 'Seleccionar todos'}
                    variant="quiet"
                    onPress={toggleAll}
                    flush
                  />
                )}
              </View>

              {visibleRepos.length === 0 ? (
                <Text style={[type.body, { color: colors.textMuted }]}>Ningún repositorio coincide con tu búsqueda.</Text>
              ) : (
                <View style={styles.list}>
                  {visibleRepos.map((repo) => {
                    const checked = selected.has(repo.fullName);
                    return (
                      <Pressable
                        key={repo.fullName}
                        onPress={() => toggle(repo.fullName)}
                        disabled={repo.alreadyProject}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked, disabled: repo.alreadyProject }}
                        style={({ hovered }) => [
                          styles.item,
                          {
                            backgroundColor: checked ? colors.accentSoft : hovered ? colors.surfaceMuted : colors.surface,
                            borderColor: checked ? colors.accent : colors.border,
                          },
                          repo.alreadyProject && { opacity: 0.55 },
                        ]}>
                        <Icon
                          name={
                            repo.alreadyProject
                              ? 'check-circle-outline'
                              : checked
                                ? 'checkbox-marked'
                                : 'checkbox-blank-outline'
                          }
                          size={22}
                          color={checked ? colors.accentStrong : colors.textMuted}
                        />
                        <View style={styles.itemBody}>
                          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{repo.fullName}</Text>
                          {repo.description && (
                            <Text style={[type.caption, { color: colors.textMuted }]} numberOfLines={1}>
                              {repo.description}
                            </Text>
                          )}
                          <View style={styles.tags}>
                            {repo.alreadyProject && <Tag icon="check" label="Ya es un proyecto" />}
                            {repo.archived && <Tag icon="archive-outline" label="Archivado" />}
                            {repo.isPrivate && <Tag icon="lock-outline" label="Privado" />}
                            {repo.isFork && <Tag icon="source-fork" label="Fork" />}
                            {repo.openIssues > 0 && (
                              <Tag icon="alert-circle-outline" label={`${repo.openIssues} ${repo.openIssues === 1 ? 'abierto' : 'abiertos'}`} />
                            )}
                            {repo.pushedAt && <Tag icon="clock-outline" label={formatShortDate(repo.pushedAt)} />}
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              </View>

              </View>

              <Text style={[type.caption, { color: colors.textMuted }]}>
                ¿No ves un repositorio? Un token fine-grained solo alcanza los repos de un dueño (tu cuenta o una
                organización) y no incluye los que compartes como colaborador en la cuenta de otra persona. Para
                otro dueño necesitas otro token.
              </Text>

              {actionError && (
                <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
                  {actionError}
                </Text>
              )}

              <Button
                label={
                  busy
                    ? 'Importando…'
                    : `Importar ${selected.size} ${selected.size === 1 ? 'proyecto' : 'proyectos'}`
                }
                icon="download"
                onPress={importSelected}
                disabled={busy || selected.size === 0}
                block
              />
            </>
          )}

          <Button label="Desconectar GitHub" variant="quiet" onPress={disconnect} disabled={busy} flush />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  emptyBox: { borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm, alignItems: 'flex-start' },
  callout: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md },
  calloutText: { flex: 1, gap: spacing.xs },
  browser: { gap: spacing.md },
  filters: { gap: spacing.md },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  ownerList: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  ownerScroll: { maxHeight: 220 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: spacing.lg },
  results: { gap: spacing.sm },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  itemBody: { flex: 1, gap: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs, marginTop: spacing.xs },
  tag: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
