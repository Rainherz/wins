import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { container } from '@/composition/container';
import { useAuth } from '@/features/auth/presentation/AuthProvider';
import { useIsWide } from '@/shared/lib/useIsWide';
import { radius, SIDEBAR_WIDTH, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Button } from '@/shared/ui/Button';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import { useCapture } from './CaptureProvider';

const ITEMS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  week: { label: 'Semana', icon: 'calendar-week', iconActive: 'calendar-week' },
  projects: { label: 'Proyectos', icon: 'folder-outline', iconActive: 'folder' },
};

export function AppNav(props: BottomTabBarProps) {
  return useIsWide() ? <Sidebar {...props} /> : <BottomBar {...props} />;
}

function useNavItems({ state, navigation }: BottomTabBarProps) {
  return state.routes
    .filter((route) => ITEMS[route.name])
    .map((route, index) => {
      const focused = state.index === state.routes.indexOf(route);
      const onPress = () => {
        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
      };
      return { key: route.key, index, focused, onPress, ...ITEMS[route.name] };
    });
}

function Sidebar(props: BottomTabBarProps) {
  const { colors, scheme, toggle } = useTheme();
  const { openAddWin } = useCapture();
  const auth = useAuth();
  const items = useNavItems(props);

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.border }]}>
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: colors.accent }]}>
          <Icon name="check" size={20} color={colors.onAccent} />
        </View>
        <Text style={[type.title, styles.wordmark, { color: colors.text }]}>Wins</Text>
      </View>

      <Button label="Agregar logro" icon="plus" onPress={openAddWin} block />

      <View style={styles.nav}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.focused }}
            style={({ hovered }) => [
              styles.navItem,
              item.focused && { backgroundColor: colors.surface, boxShadow: colors.shadowCard },
              !item.focused && hovered && { backgroundColor: colors.surfaceMuted },
            ]}>
            <Icon
              name={item.focused ? item.iconActive : item.icon}
              size={20}
              color={item.focused ? colors.accentStrong : colors.textMuted}
            />
            <Text
              style={[
                type.bodySmall,
                { color: item.focused ? colors.text : colors.textMuted, fontWeight: item.focused ? '600' : '500' },
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        {auth.status === 'signedIn' && (
          <Text style={[type.caption, styles.email, { color: colors.textMuted }]} numberOfLines={1}>
            {auth.session.email}
          </Text>
        )}
        <Button
          label={scheme === 'light' ? 'Tema oscuro' : 'Tema claro'}
          icon={scheme === 'light' ? 'weather-night' : 'white-balance-sunny'}
          variant="quiet"
          onPress={toggle}
          block
          align="start"
        />
        <Button label="Cerrar sesión" icon="logout" variant="quiet" onPress={() => container.signOut()} block align="start" />
      </View>
    </View>
  );
}

function BottomBar(props: BottomTabBarProps) {
  const { colors } = useTheme();
  const { openAddWin } = useCapture();
  const insets = useSafeAreaInsets();
  const items = useNavItems(props);

  const tab = (item: (typeof items)[number]) => (
    <Pressable
      key={item.key}
      onPress={item.onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: item.focused }}
      style={styles.tab}>
      <Icon
        name={item.focused ? item.iconActive : item.icon}
        size={24}
        color={item.focused ? colors.accentStrong : colors.textMuted}
      />
      <Text
        style={[
          type.caption,
          { color: item.focused ? colors.accentStrong : colors.textMuted, fontWeight: item.focused ? '600' : '500' },
        ]}>
        {item.label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.sidebar, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}>
      {items[0] && tab(items[0])}
      <View style={styles.addSlot}>
        <Pressable
          onPress={openAddWin}
          accessibilityRole="button"
          accessibilityLabel="Agregar un logro"
          style={({ pressed }) => [
            styles.add,
            { backgroundColor: colors.accent, boxShadow: colors.shadowRaised, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}>
          <Icon name="plus" size={28} color={colors.onAccent} />
        </Pressable>
      </View>
      {items[1] && tab(items[1])}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    padding: spacing.xl,
    gap: spacing.xl,
    borderRightWidth: 1,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mark: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 24, lineHeight: 28 },
  nav: { gap: spacing.xs },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  footer: { marginTop: 'auto', gap: spacing.xs },
  email: { paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 },
  addSlot: { flex: 1, alignItems: 'center' },
  add: {
    width: 56,
    height: 56,
    marginTop: -28,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
