import { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { useSheetEnterAnimation } from '@/shared/hooks/useSheetEnterAnimation';
import { Button } from './index';
import type { ConfirmCopy } from '@/shared/constants/confirmations';
import { createStyles } from './ConfirmDialog.styles';

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dialogAnim = useSheetEnterAnimation(open, 'dialog');

  if (!open || !copy) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={alertOnly ? onConfirm : onCancel}>
        <Animated.View style={dialogAnim}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.message}>{copy.message}</Text>
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
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
