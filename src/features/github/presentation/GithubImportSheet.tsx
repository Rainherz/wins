import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { container } from '@/composition/container';
import { formatShortDate } from '@/shared/lib/dates';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Sheet } from '@/shared/ui/Sheet';
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

  const primary = (enabled: boolean) => [
    styles.primary,
    { backgroundColor: colors.accent, opacity: enabled ? 1 : 0.4 },
  ];

  return (
    <View style={styles.form}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[type.label, { color: colors.textMuted }]}>GITHUB</Text>
          <Text style={[type.title, { color: colors.text }]}>Importar logros</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
          <Text style={{ fontSize: 22, color: colors.textMuted }}>×</Text>
        </Pressable>
      </View>

      {phase.kind === 'loading' && (
        <Text style={[type.body, { color: colors.textMuted }]}>Buscando en GitHub…</Text>
      )}

      {phase.kind === 'error' && (
        <>
          <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
            {phase.message}
          </Text>
          <Pressable onPress={reload} accessibilityRole="button" style={primary(true)}>
            <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>Reintentar</Text>
          </Pressable>
        </>
      )}

      {phase.kind === 'connect' && (
        <>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            Conecta GitHub para traer tus PRs fusionados y los issues cerrados que tengas asignados.
          </Text>
          <View style={[styles.steps, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[type.bodySmall, { color: colors.text }]}>
              1. En GitHub abre Settings → Developer settings → Personal access tokens → Fine-grained tokens.
            </Text>
            <Text style={[type.bodySmall, { color: colors.text }]}>
              2. Elige los repositorios y da permiso de solo lectura a Issues y Pull requests.
            </Text>
            <Text style={[type.bodySmall, { color: colors.text }]}>3. Pega el token aquí.</Text>
          </View>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="github_pat_…"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              type.body,
              styles.input,
              { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          />
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            El token se guarda en tu base de datos de Supabase, protegido por tu sesión.
          </Text>
          {actionError && (
            <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
              {actionError}
            </Text>
          )}
          <Pressable
            onPress={connect}
            disabled={busy || token.trim() === ''}
            accessibilityRole="button"
            style={primary(!busy && token.trim() !== '')}>
            <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>
              {busy ? 'Conectando…' : 'Conectar'}
            </Text>
          </Pressable>
        </>
      )}

      {phase.kind === 'ready' && (
        <>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            Conectado como @{phase.login}. Elige qué quieres convertir en logro.
          </Text>

          {phase.items.length === 0 ? (
            <Text style={[type.body, { color: colors.textMuted }]}>No hay nada nuevo para importar en esta semana.</Text>
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
                    style={[
                      styles.item,
                      {
                        backgroundColor: checked ? colors.accentSoft : colors.surface,
                        borderColor: checked ? colors.accent : colors.border,
                      },
                    ]}>
                    <Text style={{ fontSize: 20, color: checked ? colors.accentStrong : colors.textMuted }}>
                      {checked ? '☑' : '☐'}
                    </Text>
                    <View style={styles.itemBody}>
                      <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{item.title}</Text>
                      <Text style={[type.bodySmall, { color: colors.textMuted }]}>
                        {item.kind === 'pr' ? 'PR' : 'Issue'} · {item.repo} #{item.number} · {formatShortDate(item.doneAt)}
                        {!item.projectExists ? ' · proyecto nuevo' : ''}
                      </Text>
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
            <Pressable
              onPress={importSelected}
              disabled={busy || selected.size === 0}
              accessibilityRole="button"
              style={primary(!busy && selected.size > 0)}>
              <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>
                {busy
                  ? 'Importando…'
                  : `Importar ${selected.size} ${selected.size === 1 ? 'logro' : 'logros'}`}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={disconnect} disabled={busy} accessibilityRole="button" style={styles.link}>
            <Text style={[type.bodySmall, { color: colors.textMuted }]}>Desconectar GitHub</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { gap: spacing.xs },
  close: { minWidth: 44, minHeight: 44, alignItems: 'flex-end' },
  steps: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1 },
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
  primary: { minHeight: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
