import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { container } from '@/composition/container';
import { daysAgo, formatDaysAgo } from '@/shared/lib/dates';
import { messageOf } from '@/shared/lib/messageOf';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { ErrorNotice } from '@/shared/ui/ErrorNotice';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import { InvalidGithubTokenError } from '../application/connectGithub';
import { GithubNotConnectedError } from '../application/getImportSuggestions';
import { OPEN_WORK_LIMIT, type GithubOpenItem } from '../domain/githubOpenItem';
import { GithubConnectSheet } from './GithubConnectSheet';

type Phase =
  | { kind: 'loading' }
  | { kind: 'connect'; notice?: string }
  | { kind: 'ready'; items: GithubOpenItem[] }
  | { kind: 'error'; message: string };

async function fetchPhase(repo: string): Promise<Phase> {
  try {
    return { kind: 'ready', items: await container.getPendingWork(repo) };
  } catch (error) {
    if (error instanceof GithubNotConnectedError) return { kind: 'connect' };
    if (error instanceof InvalidGithubTokenError) {
      return { kind: 'connect', notice: 'El token guardado ya no es válido. Pega uno nuevo.' };
    }
    return { kind: 'error', message: messageOf(error) };
  }
}

type Props = {
  /** "owner/name". Give the component a `key` so it resets when the repository changes. */
  repo: string;
};

/** What is still open in the project's GitHub repository, fetched live. */
export function PendingWorkPanel({ repo }: Props) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [now] = useState(() => new Date());
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPhase(repo).then((next) => {
      if (!cancelled) setPhase(next);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const reload = async () => {
    setPhase({ kind: 'loading' });
    setPhase(await fetchPhase(repo));
  };

  const items = phase.kind === 'ready' ? phase.items : [];
  const prs = items.filter((item) => item.kind === 'pr').length;
  const capped = items.length >= OPEN_WORK_LIMIT;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[type.heading, { color: colors.text }]}>Pendientes en GitHub</Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>{repo}</Text>
        </View>
        <View style={styles.tools}>
          <IconButton icon="refresh" accessibilityLabel="Actualizar pendientes" onPress={reload} />
          <IconButton
            icon="open-in-new"
            accessibilityLabel="Abrir el repositorio en GitHub"
            onPress={() => Linking.openURL(`https://github.com/${repo}`)}
          />
        </View>
      </View>

      {phase.kind === 'loading' && <Text style={[type.bodySmall, { color: colors.textMuted }]}>Consultando GitHub…</Text>}

      {phase.kind === 'error' && <ErrorNotice message={phase.message} onRetry={reload} />}

      {phase.kind === 'connect' && (
        <>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            {phase.notice ?? 'Conecta GitHub para ver los issues y PRs abiertos de este repositorio.'}
          </Text>
          <Button label="Conectar GitHub" icon="github" onPress={() => setConnecting(true)} />
        </>
      )}

      {phase.kind === 'ready' && (
        <>
          {items.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.surfaceMuted }]}>
              <Icon name="check-all" size={22} color={colors.textMuted} />
              <Text style={[type.bodySmall, { color: colors.textMuted }]}>No hay issues ni PRs abiertos.</Text>
            </View>
          ) : (
            <>
              <Text style={[type.bodySmall, { color: colors.textMuted }]}>
                {items.length}
                {capped ? '+' : ''} {items.length === 1 ? 'abierto' : 'abiertos'} · {prs} {prs === 1 ? 'PR' : 'PRs'} ·{' '}
                {items.length - prs} {items.length - prs === 1 ? 'issue' : 'issues'}
              </Text>

              <View style={[styles.list, { borderColor: colors.border }]}>
                {items.map((item, index) => (
                  <Pressable
                    key={item.number}
                    onPress={() => Linking.openURL(item.url)}
                    accessibilityRole="link"
                    accessibilityLabel={`Abrir ${item.kind === 'pr' ? 'PR' : 'issue'} ${item.number} en GitHub`}
                    style={({ hovered }) => [
                      styles.item,
                      index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                      hovered && { backgroundColor: colors.surfaceMuted },
                    ]}>
                    <Icon
                      name={item.kind === 'pr' ? 'source-pull' : 'alert-circle-outline'}
                      size={18}
                      color={item.isDraft ? colors.textMuted : colors.accentStrong}
                    />
                    <View style={styles.itemBody}>
                      <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{item.title}</Text>
                      <Text style={[type.caption, { color: colors.textMuted }]}>
                        #{item.number}
                        {item.isDraft ? ' · borrador' : ''}
                        {item.author ? ` · @${item.author}` : ''} · {formatDaysAgo(daysAgo(item.updatedAt, now))}
                      </Text>
                      {item.labels.length > 0 && (
                        <View style={styles.labels}>
                          {item.labels.slice(0, 3).map((label) => (
                            <View key={label} style={[styles.label, { backgroundColor: colors.border }]}>
                              <Text style={[type.caption, { color: colors.textMuted }]}>{label}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>

              {capped && (
                <Text style={[type.caption, { color: colors.textMuted }]}>
                  Mostrando los {OPEN_WORK_LIMIT} actualizados más recientemente.
                </Text>
              )}
            </>
          )}
        </>
      )}

      <GithubConnectSheet
        visible={connecting}
        notice={phase.kind === 'connect' ? phase.notice : undefined}
        onClose={() => setConnecting(false)}
        onConnected={reload}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  titleBlock: { flex: 1, gap: 2 },
  tools: { flexDirection: 'row' },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.md },
  list: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.md },
  itemBody: { flex: 1, gap: 2 },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  label: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
});
