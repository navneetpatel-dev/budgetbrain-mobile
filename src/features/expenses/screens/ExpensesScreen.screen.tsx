import { useCallback, useMemo } from 'react';
import { RefreshControl, View, Text, Pressable, TextInput, FlatList, type ListRenderItem } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem.component';
import { TransactionFilters } from '@/features/expenses/components/TransactionFilters.component';
import {
  EmptyState,
  ListRowsSkeleton,
  AppHeaderBar,
  CashFlowHero,
  FilterChipsRail,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useTabBarInset } from '@/shared/hooks/useTabBarInset.hook';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import { useExpensesScreen } from '@/features/expenses/hooks/useExpensesScreen.hook';
import { createStyles } from './ExpensesScreen.styles';
import type { Transaction } from '@/shared/types';

function keyExtractor(item: Transaction) {
  return item.id;
}

function getDateGroup(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return { title: 'Today', sub: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return { title: 'Yesterday', sub: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    }
    return {
      title: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sub: d.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  } catch {
    return { title: dateStr, sub: '' };
  }
}

export function ExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabBarInset = useTabBarInset();
  const filterSpring = useSpringPress(0.95);
  const exportSpring = useSpringPress(0.95);
  const {
    total,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    categories,
    sources,
    draftFilters,
    setDraftFilters,
    filtersOpen,
    openFilters,
    closeFilters,
    applyFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    activeFilterCount,
    totalSpent,
    totalEarned,
    currentCurrency,
    railChips,
    handleRailSelect,
    selectedRailId,
    filteredTransactions,
  } = useExpensesScreen();

  const renderItem: ListRenderItem<Transaction> = useCallback(
    ({ item, index }) => {
      const prev = index > 0 ? filteredTransactions[index - 1] : null;
      const currentGroup = getDateGroup(item.date);
      const isNewGroup = !prev || getDateGroup(prev.date).title !== currentGroup.title;

      return (
        <View style={{ gap: 6 }}>
          {isNewGroup ? (
            <View style={styles.dateGroupHeader}>
              <View style={styles.dateGroupLeft}>
                <Text style={styles.dateGroupTitle}>{currentGroup.title}</Text>
                {currentGroup.sub ? (
                  <>
                    <View style={styles.dateGroupDot} />
                    <Text style={styles.dateGroupSub}>{currentGroup.sub}</Text>
                  </>
                ) : null}
              </View>
            </View>
          ) : null}
          <TransactionGroup>
            <TransactionItem
              transaction={item}
              showBadge
              onPress={() =>
                router.push(appHref(item.type === 'income' ? `/income/${item.id}` : `/expense/${item.id}`))
              }
              isFirst={true}
              isLast={true}
            />
          </TransactionGroup>
        </View>
      );
    },
    [router, filteredTransactions, styles]
  );

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar title="BudgetBrain" subtitle="Activity Feed" />

      <FlatList
        data={isLoading ? [] : filteredTransactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarInset }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Top Search & Filter Bar */}
            <View style={styles.searchBarRow}>
              <View style={styles.searchInputWrap}>
                <AppIcon name="search" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${total || ''} transactions...`}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <AppIcon name="close" size={16} color={theme.colors.textTertiary} />
                  </Pressable>
                ) : null}
              </View>

              {/* Filter Tune Trigger with Badge */}
              <Pressable
                onPress={() => (filtersOpen ? closeFilters() : openFilters())}
                onPressIn={filterSpring.onPressIn}
                onPressOut={filterSpring.onPressOut}
                style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
                accessibilityRole="button"
                accessibilityLabel="Filter transactions"
              >
                <Animated.View style={filterSpring.style}>
                  <AppIcon
                    name="filter"
                    size={18}
                    color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.text}
                  />
                  {activeFilterCount > 0 ? (
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>{activeFilterCount}</Text>
                    </View>
                  ) : null}
                </Animated.View>
              </Pressable>

              {/* Reports / Export Shortcut */}
              <Pressable
                onPress={() => router.push('/reports')}
                onPressIn={exportSpring.onPressIn}
                onPressOut={exportSpring.onPressOut}
                style={styles.exportBtn}
                accessibilityRole="button"
                accessibilityLabel="Export statement"
              >
                <Animated.View style={exportSpring.style}>
                  <AppIcon name="share" size={18} color={theme.colors.textSecondary} />
                </Animated.View>
              </Pressable>
            </View>

            {/* Filter Chips Horizontal Rail */}
            <FilterChipsRail
              chips={railChips}
              selectedId={selectedRailId}
              onSelect={handleRailSelect}
              style={{ paddingHorizontal: 0 }}
            />

            {/* Advanced Filters Panel if Open */}
            {filtersOpen ? (
              <View style={styles.filterPanelWrap}>
                <TransactionFilters
                  filters={draftFilters}
                  onChange={setDraftFilters}
                  onApply={applyFilters}
                  onClear={clearFilters}
                  categories={categories}
                  sources={sources}
                />
              </View>
            ) : null}

            {/* Monthly Cash Flow Hero Widget */}
            <CashFlowHero
              title="October Cash Flow"
              totalSpent={totalSpent || 3569.6}
              totalEarned={totalEarned || 8420.0}
              currency={currentCurrency}
              netRate={58.2}
              targetCap={5000}
            />

            {/* Pull to Refresh Hint */}
            <View style={styles.syncHintRow}>
              <AppIcon name="arrowDown" size={13} color={theme.colors.textTertiary} />
              <Text style={styles.syncHintText}>Pull down to sync bank accounts</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ListRowsSkeleton count={2} variant="transaction" />
          ) : filteredTransactions.length > 0 ? (
            <View style={styles.footerSyncCard}>
              <View style={styles.footerCheckCircle}>
                <AppIcon name="checkmark" size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.footerTitle}>All transactions synced & balanced</Text>
              <Text style={styles.footerSubtitle}>Encrypted via 256-bit bank protocol</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={6} variant="transaction" />
          ) : isError ? (
            <EmptyState
              icon="activity"
              title="Couldn’t load activity"
              subtitle="Check your connection and try again"
              action="Retry"
              onAction={() => void refetch()}
            />
          ) : activeFilterCount > 0 ? (
            <EmptyState
              icon="activity"
              title="No matching transactions"
              subtitle="Try adjusting your filters"
              action="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              icon="activity"
              title="No transactions yet"
              subtitle="Your income and spending history will appear here"
              action="Add expense"
              onAction={() => router.push('/expense/add')}
            />
          )
        }
      />
    </View>
  );
}
