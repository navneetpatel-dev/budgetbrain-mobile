import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { OptionChips, StackNavHeader } from '@/shared/components/ui';
import { useDetectedHistory, type DetectedHistoryFilter } from '../hooks/useDetectedHistory.hook';
import { DetectedHistoryList } from '../components/history/DetectedHistoryList.component';
import { createStyles } from './DetectedHistoryScreen.styles';

const FILTERS: DetectedHistoryFilter[] = ['added', 'auto', 'confirmed', 'transfers'];
const FILTER_LABEL: Record<DetectedHistoryFilter, string> = {
  added: 'All',
  auto: 'Automatic',
  confirmed: 'Confirmed',
  transfers: 'Transfers',
};

/** Transactions added from bank messages, with Undo (plan T5.5). */
export function DetectedHistoryScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { filter, setFilter, items, isRefreshing, refresh, undo, undoingId, error } = useDetectedHistory();

  return (
    <View style={styles.container}>
      <StackNavHeader title="Detected transactions" />
      <DetectedHistoryList
        data={items}
        onUndo={undo}
        undoingId={undoingId}
        onRefresh={refresh}
        refreshing={isRefreshing}
        ListHeaderComponent={
          <View style={styles.header}>
            <OptionChips options={FILTERS} value={filter} onChange={setFilter} getLabel={(value) => FILTER_LABEL[value]} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
      />
    </View>
  );
}
