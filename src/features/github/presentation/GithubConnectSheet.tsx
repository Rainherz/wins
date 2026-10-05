import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme/tokens';
import { Sheet } from '@/shared/ui/Sheet';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { GithubConnectPanel } from './GithubConnectPanel';

type Props = {
  visible: boolean;
  notice?: string;
  onClose: () => void;
  onConnected: () => Promise<void>;
};

export function GithubConnectSheet({ visible, notice, onClose, onConnected }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.form}>
        <SheetHeader title="Conectar GitHub" description="Para ver los pendientes de tus repositorios." onClose={onClose} />
        <GithubConnectPanel
          notice={notice}
          onConnected={async () => {
            onClose();
            await onConnected();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
});
