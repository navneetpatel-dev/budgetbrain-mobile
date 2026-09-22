import { useCallback, useMemo } from 'react';
import { FlatList, Text, View, type ListRenderItem } from 'react-native';
import type { Attachment } from '@/features/expenses/types/expenses.types';
import { useTheme } from '@/shared/theme';
import { AttachmentRow } from './AttachmentRow.component';
import { createStyles } from './AttachmentList.styles';

function keyExtractor(item: Attachment) {
  return item.id;
}

export function AttachmentList({
  attachments,
  checkingId,
  notReadyId,
  onCheck,
  onDelete,
}: {
  attachments: Attachment[];
  checkingId: string | null;
  notReadyId: string | null;
  onCheck: (attachmentId: string) => void;
  onDelete: (attachmentId: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const renderItem: ListRenderItem<Attachment> = useCallback(({ item }) => (
    <AttachmentRow
      attachment={item}
      checking={checkingId === item.id}
      notReady={notReadyId === item.id}
      onCheck={onCheck}
      onDelete={onDelete}
    />
  ), [checkingId, notReadyId, onCheck, onDelete]);

  if (attachments.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Receipt Attachments</Text>
      {/* Parent form already scrolls, so this list sizes to its rows. */}
      <FlatList
        data={attachments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
      />
    </View>
  );
}
