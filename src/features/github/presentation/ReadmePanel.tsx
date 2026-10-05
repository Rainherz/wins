import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { container } from '@/composition/container';
import { messageOf } from '@/shared/lib/messageOf';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { ErrorNotice } from '@/shared/ui/ErrorNotice';
import { IconButton } from '@/shared/ui/IconButton';
import { Markdown } from '@/shared/ui/Markdown';
import { Text } from '@/shared/ui/Text';
import { InvalidGithubTokenError } from '../application/connectGithub';
import { GithubNotConnectedError } from '../application/getImportSuggestions';
import type { Readme } from '../application/getReadme';

/** Height of the preview before "show all". */
const COLLAPSED_HEIGHT = 320;

type Phase =
  | { kind: 'loading' }
  /** Not connected or token rejected: the pending panel owns the "connect" action, so this card only explains. */
  | { kind: 'disconnected' }
  | { kind: 'missing' }
  | { kind: 'ready'; readme: Readme }
  | { kind: 'error'; message: string };

async function fetchPhase(repo: string): Promise<Phase> {
  try {
    const readme = await container.getReadme(repo);
    return readme ? { kind: 'ready', readme } : { kind: 'missing' };
  } catch (error) {
    if (error instanceof GithubNotConnectedError || error instanceof InvalidGithubTokenError) return { kind: 'disconnected' };
    return { kind: 'error', message: messageOf(error) };
  }
}

type Props = {
  /** "owner/name". Give the component a `key` so it resets when the repository changes. */
  repo: string;
};

/** The repository's README, so the project can be understood at a glance. */
export function ReadmePanel({ repo }: Props) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

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

  const overflows = contentHeight > COLLAPSED_HEIGHT;
  const clipped = !expanded && (contentHeight === 0 || overflows);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowCard }]}>
      <View style={styles.header}>
        <Text style={[type.heading, { color: colors.text }]}>Acerca del proyecto</Text>
        <IconButton
          icon="open-in-new"
          accessibilityLabel="Abrir el README en GitHub"
          onPress={() => Linking.openURL(`https://github.com/${repo}#readme`)}
        />
      </View>

      {phase.kind === 'loading' && <Text style={[type.bodySmall, { color: colors.textMuted }]}>Leyendo el README…</Text>}

      {phase.kind === 'disconnected' && (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>
          Conecta GitHub para leer aquí el README del repositorio.
        </Text>
      )}

      {phase.kind === 'missing' && (
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>Este repositorio no tiene un README.</Text>
      )}

      {phase.kind === 'error' && <ErrorNotice message={phase.message} onRetry={reload} />}

      {phase.kind === 'ready' && (
        <>
          <View style={clipped ? { maxHeight: COLLAPSED_HEIGHT, overflow: 'hidden' } : undefined}>
            <View onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}>
              <Markdown source={phase.readme.markdown} baseUrl={`https://github.com/${repo}/blob/HEAD/`} />
            </View>
          </View>

          {overflows && (
            <Button
              label={expanded ? 'Mostrar menos' : 'Mostrar todo el README'}
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              variant="secondary"
              onPress={() => setExpanded((current) => !current)}
            />
          )}
          {phase.readme.truncated && (
            <Text style={[type.caption, { color: colors.textMuted }]}>
              El README es muy largo y se muestra recortado. Ábrelo en GitHub para verlo completo.
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
});
