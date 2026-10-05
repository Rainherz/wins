import { Tabs } from 'expo-router/js-tabs';

import { useTheme } from '@/shared/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentStrong,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600', paddingBottom: 8 },
      }}>
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
    </Tabs>
  );
}
