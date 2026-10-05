import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';

export function SignInScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const inputStyle = [
    type.body,
    styles.input,
    { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={[type.display, styles.title, { color: colors.text }]}>Wins</Text>
          <Text style={[type.body, { color: colors.textMuted }]}>Inicia sesión para ver qué avanzaste.</Text>
        </View>

        <View style={styles.field}>
          <Text style={[type.bodySmall, styles.label, { color: colors.text }]}>Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={inputStyle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[type.bodySmall, styles.label, { color: colors.text }]}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={canSubmit ? submit : undefined}
            style={inputStyle}
          />
        </View>

        {error && (
          <Text accessibilityRole="alert" style={[type.bodySmall, { color: colors.accentStrong }]}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          style={[styles.button, { backgroundColor: colors.accent, opacity: canSubmit ? 1 : 0.4 }]}>
          <Text style={[type.body, { color: colors.onAccent, fontWeight: '600' }]}>
            {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 400, gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { fontSize: 32, lineHeight: 36 },
  field: { gap: spacing.sm },
  label: { fontWeight: '600' },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  button: { minHeight: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
});
