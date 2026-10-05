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

/** Bottom sheet on mobile, centered dialog on wide screens. Children unmount when hidden. */
export function Sheet({ visible, onClose, children }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, isDesktop ? styles.overlayCenter : styles.overlayBottom]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />
        <View
          style={[
            styles.sheet,
            isDesktop ? styles.sheetDesktop : styles.sheetMobile,
            { backgroundColor: colors.surface, boxShadow: colors.shadowRaised },
          ]}>
          {!isDesktop && <View style={[styles.handle, { backgroundColor: colors.border }]} />}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(31, 30, 27, 0.45)' },
  overlayBottom: { justifyContent: 'flex-end' },
  overlayCenter: { justifyContent: 'center', alignItems: 'center' },
  sheet: { maxHeight: '90%' },
  sheetMobile: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, width: '100%' },
  sheetDesktop: { borderRadius: radius.xl, width: 480 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.full, marginTop: spacing.sm },
  content: { padding: spacing.xl, paddingTop: spacing.lg },
});
