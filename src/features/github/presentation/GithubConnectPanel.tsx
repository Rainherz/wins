import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { container } from '@/composition/container';
import { messageOf } from '@/shared/lib/messageOf';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';

type Props = {
  /** Called once the token was validated and saved. */
  onConnected: () => Promise<void>;
  /** Why the token is being requested again, for example when the saved one was rejected. */
  notice?: string;
};

/** Shared by every GitHub sheet: asks for a read-only token and connects the account. */
export function GithubConnectPanel({ onConnected, notice }: Props) {
  const { colors } = useTheme();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      await container.connectGithub(token);
      setToken('');
      await onConnected();
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!!notice && (
        <View style={[styles.notice, { backgroundColor: colors.accentSoft }]} accessibilityRole="alert">
          <Icon name="alert-circle-outline" size={20} color={colors.accentStrong} />
          <Text style={[type.bodySmall, styles.noticeText, { color: colors.text }]}>{notice}</Text>
        </View>
      )}

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

      {!!error && (
        <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
          {error}
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
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md },
  noticeText: { flex: 1 },
  steps: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
});
