import { memo, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import type { Attachment } from '@/features/expenses/types/expenses.types';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AttachmentList.styles';

export const AttachmentRow = memo(function AttachmentRow({
  attachment,
  checking,
  notReady,
  onCheck,
  onDelete,
}: {
  attachment: Attachment;
  checking: boolean;
  notReady: boolean;
  onCheck: (attachmentId: string) => void;
  onDelete: (attachmentId: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sizeLabel = `${Math.round(attachment.fileSize / 1024)} KB`;

  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <AppIcon name="receipt" size={20} color={theme.colors.primary} />
        <View style={styles.meta}>
          <Text style={styles.fileName} numberOfLines={1}>
            {attachment.fileName}
          </Text>
          <Text style={styles.fileSize}>{sizeLabel}</Text>
          {notReady ? (
            <Text style={styles.notReady}>No scanned details yet — try again shortly</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        {checking ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Pressable
            onPress={() => onCheck(attachment.id)}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="Check for scanned receipt details"
          >
            <AppIcon name="sparkles" size={16} color={theme.colors.primary} />
          </Pressable>
        )}
        <Pressable
          onPress={() => onDelete(attachment.id)}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Delete attachment"
        >
          <AppIcon name="trash" size={16} color={theme.colors.danger} />
        </Pressable>
      </View>
    </View>
  );
});
