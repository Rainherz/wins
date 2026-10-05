import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AuthProvider, useAuth } from '@/features/auth/presentation/AuthProvider';
import { ThemeProvider, useTheme } from '@/shared/theme/ThemeProvider';

function Navigator() {
  const { scheme, colors } = useTheme();
  const auth = useAuth();

  if (auth.status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  const isSignedIn = auth.status === 'signedIn';

  return (
    <>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
