import { Tabs } from 'expo-router/js-tabs';

import { useIsWide } from '@/shared/lib/useIsWide';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { AppNav } from '@/shell/AppNav';
import { CaptureProvider } from '@/shell/CaptureProvider';

export default function TabsLayout() {
  const { colors } = useTheme();
  const isWide = useIsWide();

  return (
    <CaptureProvider>
      <Tabs
        tabBar={(props) => <AppNav {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: isWide ? 'left' : 'bottom',
          sceneStyle: { backgroundColor: colors.bg },
        }}>
        <Tabs.Screen name="week" options={{ title: 'Semana' }} />
        <Tabs.Screen name="projects" options={{ title: 'Proyectos' }} />
      </Tabs>
    </CaptureProvider>
  );
}
