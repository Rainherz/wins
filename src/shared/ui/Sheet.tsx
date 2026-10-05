import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { radius, spacing } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const DESKTOP_BREAKPOINT = 768;

/** Bottom sheet on mobile, centered modal on wide screens. Children unmount when hidden. */
export function Sheet({ visible, onClose, children }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, isDesktop ? styles.overlayCenter : styles.overlayBottom]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={[
            styles.sheet,
            isDesktop ? styles.sheetDesktop : styles.sheetMobile,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlayBottom: { justifyContent: 'flex-end' },
  overlayCenter: { justifyContent: 'center', alignItems: 'center' },
  sheet: { borderWidth: 1, maxHeight: '90%' },
  sheetMobile: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, width: '100%' },
  sheetDesktop: { borderRadius: radius.lg, width: 480 },
  content: { padding: spacing.xl },
});
