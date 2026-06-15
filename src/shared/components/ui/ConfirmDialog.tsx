import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Button } from './index';
import type { ConfirmCopy } from '@/shared/constants/confirmations';

export function ConfirmDialog({
  open,
  copy,
  loading,
  alertOnly,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  copy: ConfirmCopy | null;
  loading?: boolean;
  alertOnly?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = useTheme();

  if (!open || !copy) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.overlay, { backgroundColor: theme.colors.overlay }]} onPress={alertOnly ? onConfirm : onCancel}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.xl,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>{copy.title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{copy.message}</Text>
          <View style={styles.actions}>
            <Button
              title={copy.confirmLabel}
              onPress={onConfirm}
              variant={copy.destructive ? 'danger' : 'primary'}
              loading={loading}
              disabled={loading}
              size="lg"
            />
            {!alertOnly && (
              <Button
                title={copy.cancelLabel ?? 'Cancel'}
                onPress={onCancel}
                variant="outline"
                disabled={loading}
                size="lg"
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 0,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 20,
  },
  actions: {
    gap: 8,
  },
});
