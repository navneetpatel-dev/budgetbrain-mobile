import React, { useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '@/shared/theme';
import type { DetectedTransaction } from '../../types/transactionDetection.types';
import { DetectedTransactionRow } from './DetectedTransactionRow.component';
import { createStyles } from './DetectedTransactionList.styles';

export interface DetectedTransactionListProps {
  data: DetectedTransaction[];
  onConfirm: (id: string, categoryId?: string) => void;
  onDismiss: (id: string) => void;
  onPress?: (transaction: DetectedTransaction) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
}

export function DetectedTransactionList({
  data,
  onConfirm,
  onDismiss,
  onPress,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
}: DetectedTransactionListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderItem = ({ item }: { item: DetectedTransaction }) => (
    <DetectedTransactionRow
      transaction={item}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      onPress={onPress}
    />
  );

  const keyExtractor = (item: DetectedTransaction) => item.id;

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
