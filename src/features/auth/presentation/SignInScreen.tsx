import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';

export function SignInScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // On success the session listener swaps this screen for the app.
      await container.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadowRaised }]}>
        <View style={styles.header}>
          <View style={[styles.mark, { backgroundColor: colors.accent }]}>
            <Icon name="check" size={28} color={colors.onAccent} />
          </View>
          <Text style={[type.display, { color: colors.text }]}>Wins</Text>
          <Text style={[type.body, { color: colors.textMuted }]}>Inicia sesión para ver qué avanzaste.</Text>
        </View>

        <View style={styles.fields}>
          <TextField
            label="Correo electrónico"
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextField
            label="Contraseña"
            icon="lock-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={canSubmit ? submit : undefined}
            trailing={
              <IconButton
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword((current) => !current)}
                size={18}
              />
            }
          />
        </View>

        {!!error && (
          <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
            {error}
          </Text>
        )}

        <Button
          label={submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          onPress={submit}
          disabled={!canSubmit}
          block
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 420, borderRadius: radius.xl, padding: spacing.xxl, gap: spacing.xl },
  header: { gap: spacing.sm, alignItems: 'flex-start' },
  mark: { width: 52, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  fields: { gap: spacing.lg },
});
