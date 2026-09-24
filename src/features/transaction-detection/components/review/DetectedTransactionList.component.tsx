import React, { useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '@/shared/theme';
import type { ReviewItem } from '../../hooks/useDetectedTransactionsReview.hook';
import { DetectedTransactionRow } from './DetectedTransactionRow.component';
import { LocalDetectedRow } from './LocalDetectedRow.component';
import { createStyles } from './DetectedTransactionList.styles';

export interface DetectedTransactionListProps {
  data: ReviewItem[];
  onConfirm: (id: string) => void;
  onEdit: (id: string) => void;
  onDismiss: (id: string) => void;
  onDiscardLocal: (clientId: string) => void;
  /** Row currently being confirmed or ignored. */
  busyId?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
}

export function DetectedTransactionList({
  data,
  onConfirm,
  onEdit,
  onDismiss,
  onDiscardLocal,
  busyId,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
}: DetectedTransactionListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderItem = ({ item }: { item: ReviewItem }) =>
    item.kind === 'server' ? (
      <DetectedTransactionRow
        transaction={item.item}
        onConfirm={onConfirm}
        onEdit={onEdit}
        onDismiss={onDismiss}
        busy={item.id === busyId}
      />
    ) : (
      <LocalDetectedRow item={item.item} onDiscard={onDiscardLocal} />
    );

  const keyExtractor = (item: ReviewItem) => item.id;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptySubtitle}>
        No unreviewed transactions detected from your bank SMS. New transactions will appear here automatically.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    />
  );
}
