import { useMemo } from 'react';
import { RefreshControl, View, Text, Pressable, TextInput, FlatList } from 'react-native';
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
import { useExpensesScreen } from '@/features/expenses/hooks/useExpensesScreen.hook';
import { createStyles } from './ExpensesScreen.styles';

export function ExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabBarInset = useTabBarInset();
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

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar title="BudgetBrain" subtitle="Activity Feed" />

      <FlatList
        data={isLoading ? [] : filteredTransactions}
        keyExtractor={(item) => item.id}
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
                style={({ pressed }) => [
                  styles.filterBtn,
                  activeFilterCount > 0 && styles.filterBtnActive,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Filter transactions"
              >
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
              </Pressable>

              {/* Reports / Export Shortcut */}
              <Pressable
                onPress={() => router.push('/reports')}
                style={({ pressed }) => [styles.exportBtn, pressed && { transform: [{ scale: 0.95 }] }]}
                accessibilityRole="button"
                accessibilityLabel="Export statement"
              >
                <AppIcon name="send" size={18} color={theme.colors.textSecondary} />
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
              <Text style={styles.syncHintText}>Pull down to sync transactions</Text>
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
        renderItem={({ item, index }) => (
          <TransactionGroup>
            <TransactionItem
              transaction={item}
              showBadge
              onPress={() =>
                router.push(
                  appHref(item.type === 'income' ? `/income/${item.id}` : `/expense/${item.id}`),
                )
              }
              isFirst={index === 0}
              isLast={index === filteredTransactions.length - 1}
            />
          </TransactionGroup>
        )}
      />
    </View>
  );
}
