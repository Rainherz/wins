import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { container } from '@/composition/container';
import { formatShortDate } from '@/shared/lib/dates';
import { messageOf } from '@/shared/lib/messageOf';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { InvalidGithubTokenError } from '../application/connectGithub';
import { GithubNotConnectedError, type ImportSuggestion } from '../application/getImportSuggestions';
import { GithubConnectPanel } from './GithubConnectPanel';

type Props = {
  visible: boolean;
  /** Import window: [from, to). */
  from: Date;
  to: Date;
  onClose: () => void;
  onImported: () => Promise<void>;
};

type Phase =
  | { kind: 'loading' }
  | { kind: 'connect'; notice?: string }
  | { kind: 'ready'; login: string; items: ImportSuggestion[] }
  | { kind: 'error'; message: string };

async function fetchPhase(from: Date, to: Date): Promise<Phase> {
  try {
    const { login, suggestions } = await container.getImportSuggestions(from, to);
    return { kind: 'ready', login, items: suggestions };
  } catch (error) {
    if (error instanceof GithubNotConnectedError) return { kind: 'connect' };
    if (error instanceof InvalidGithubTokenError) return { kind: 'connect', notice: 'El token guardado ya no es válido (puede que lo hayas revocado o que haya expirado). Pega uno nuevo.' };
    return { kind: 'error', message: messageOf(error) };
  }
}

export function GithubImportSheet({ visible, ...rest }: Props) {
  return (
    <Sheet visible={visible} onClose={rest.onClose}>
      <Form {...rest} />
    </Sheet>
  );
}

function Form({ from, to, onClose, onImported }: Omit<Props, 'visible'>) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const apply = (next: Phase) => {
    setPhase(next);
    setSelected(new Set(next.kind === 'ready' ? next.items.map((item) => item.externalId) : []));
  };

  useEffect(() => {
    let cancelled = false;
    fetchPhase(from, to).then((next) => {
      if (cancelled) return;
      setPhase(next);
      setSelected(new Set(next.kind === 'ready' ? next.items.map((item) => item.externalId) : []));
    });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const reload = async () => {
    setPhase({ kind: 'loading' });
    apply(await fetchPhase(from, to));
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await container.disconnectGithub();
      apply({ kind: 'connect' });
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
      await container.importFromGithub(phase.items.filter((item) => selected.has(item.externalId)));
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

  const description =
    phase.kind === 'ready'
      ? `Conectado como @${phase.login}. Elige qué quieres convertir en logro.`
      : 'Trae tus PRs fusionados y los issues cerrados que tengas asignados.';

  return (
    <View style={styles.form}>
      <SheetHeader title="Importar logros de GitHub" description={description} onClose={onClose} />

      {phase.kind === 'loading' && <Text style={[type.body, { color: colors.textMuted }]}>Buscando en GitHub…</Text>}

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
          {phase.items.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceMuted }]}>
              <Icon name="check-all" size={24} color={colors.textMuted} />
              <Text style={[type.body, { color: colors.textMuted }]}>No hay nada nuevo para importar en esta semana.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {phase.items.map((item) => {
                const checked = selected.has(item.externalId);
                return (
                  <Pressable
                    key={item.externalId}
                    onPress={() => toggle(item.externalId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    style={({ hovered }) => [
                      styles.item,
                      {
                        backgroundColor: checked ? colors.accentSoft : hovered ? colors.surfaceMuted : colors.surface,
                        borderColor: checked ? colors.accent : colors.border,
                      },
                    ]}>
                    <Icon
                      name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={22}
                      color={checked ? colors.accentStrong : colors.textMuted}
                    />
                    <View style={styles.itemBody}>
                      <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{item.title}</Text>
                      <View style={styles.itemMeta}>
                        <Icon
                          name={item.kind === 'pr' ? 'source-merge' : 'circle-slice-8'}
                          size={14}
                          color={colors.textMuted}
                        />
                        <Text style={[type.caption, { color: colors.textMuted }]}>
                          {item.repo} #{item.number} · {formatShortDate(item.doneAt)}
                          {!item.projectExists ? ' · proyecto nuevo' : ''}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {actionError && (
            <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
              {actionError}
            </Text>
          )}

          {phase.items.length > 0 && (
            <Button
              label={
                busy
                  ? 'Importando…'
                  : `Importar ${selected.size} ${selected.size === 1 ? 'logro' : 'logros'}`
              }
              icon="download"
              onPress={importSelected}
              disabled={busy || selected.size === 0}
              block
            />
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
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  itemBody: { flex: 1, gap: 2 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
