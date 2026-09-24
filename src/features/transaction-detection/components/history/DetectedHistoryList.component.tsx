import React, { useMemo } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useTheme } from '@/shared/theme';
import type { DetectedTransactionDto } from '../../types/transactionDetection.types';
import { DetectedHistoryRow } from './DetectedHistoryRow.component';
import { createStyles } from './DetectedHistoryList.styles';

export interface DetectedHistoryListProps {
  data: DetectedTransactionDto[];
  onUndo: (id: string) => void;
  undoingId?: string;
  onRefresh: () => void;
  refreshing: boolean;
  ListHeaderComponent?: React.ReactElement | null;
}

export function DetectedHistoryList({ data, onUndo, undoingId, onRefresh, refreshing, ListHeaderComponent }: DetectedHistoryListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const renderItem = ({ item }: { item: DetectedTransactionDto }) => (
    <DetectedHistoryRow item={item} onUndo={onUndo} busy={item.id === undoingId} />
  );
  const keyExtractor = (item: DetectedTransactionDto) => item.id;
  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Nothing here yet. Transactions added from your bank messages will show up here.</Text>
    </View>
  );
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
    />
  );
}
