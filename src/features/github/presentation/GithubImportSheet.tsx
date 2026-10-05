import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { container } from '@/composition/container';
import { formatShortDate } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import { GithubNotConnectedError, type ImportSuggestion } from '../application/getImportSuggestions';

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
  | { kind: 'connect' }
  | { kind: 'ready'; login: string; items: ImportSuggestion[] }
  | { kind: 'error'; message: string };

const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Ocurrió un error inesperado.');

async function fetchPhase(from: Date, to: Date): Promise<Phase> {
  try {
    const { login, suggestions } = await container.getImportSuggestions(from, to);
    return { kind: 'ready', login, items: suggestions };
  } catch (error) {
    if (error instanceof GithubNotConnectedError) return { kind: 'connect' };
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
  const [token, setToken] = useState('');
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

  const connect = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await container.connectGithub(token);
      setToken('');
      await reload();
    } catch (error) {
      setActionError(messageOf(error));
    } finally {
      setBusy(false);
    }
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
      <SheetHeader title="Importar de GitHub" description={description} onClose={onClose} />

      {phase.kind === 'loading' && <Text style={[type.body, { color: colors.textMuted }]}>Buscando en GitHub…</Text>}

      {phase.kind === 'error' && (
        <>
          <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
            {phase.message}
          </Text>
          <Button label="Reintentar" icon="refresh" onPress={reload} />
        </>
      )}

      {phase.kind === 'connect' && (
        <>
          <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[type.bodySmall, { color: colors.text }]}>
              1. En GitHub abre Settings → Developer settings → Personal access tokens → Fine-grained tokens.
            </Text>
            <Text style={[type.bodySmall, { color: colors.text }]}>
              2. Elige los repositorios y da permiso de solo lectura a Issues y Pull requests.
            </Text>
            <Text style={[type.bodySmall, { color: colors.text }]}>3. Pega el token aquí.</Text>
          </View>

          <TextField
            label="Token de GitHub"
            icon="key-outline"
            value={token}
            onChangeText={setToken}
            placeholder="github_pat_…"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[type.caption, { color: colors.textMuted }]}>
            El token se guarda en tu base de datos de Supabase, protegido por tu sesión.
          </Text>

          {actionError && (
            <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
              {actionError}
            </Text>
          )}
          <Button
            label={busy ? 'Conectando…' : 'Conectar'}
            icon="github"
            onPress={connect}
            disabled={busy || token.trim() === ''}
            block
          />
        </>
      )}

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
  steps: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
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
