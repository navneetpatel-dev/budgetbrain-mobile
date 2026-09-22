import { useCallback, useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text, FlatList, Pressable, ScrollView, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem.component';
import { EmptyState, ListRowsSkeleton, AppHeaderBar, FilterChipsRail } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useIncomeScreen } from '@/features/income/hooks/useIncomeScreen.hook';
import { useTabBarInset } from '@/shared/hooks/useTabBarInset.hook';
import { createStyles } from './IncomeScreen.styles';
import type { Transaction } from '@/shared/types';

function keyExtractor(item: Transaction) {
  return item.id;
}

export function IncomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const {
    transactionTotal,
    isLoading,
    isError,
    isRefetching,
    refetch,
    refreshAll,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    sources,
    sourceCount,
    totalEarned,
    currency,
    filterChips,
    activeCategory,
    setActiveCategory,
    filteredTransactions,
  } = useIncomeScreen();

  const renderItem: ListRenderItem<Transaction> = useCallback(
    ({ item }) => (
      <TransactionGroup>
        <TransactionItem
          transaction={item}
          onPress={() => router.push(appHref(`/income/${item.id}`))}
          showBadge
          isFirst
          isLast
        />
      </TransactionGroup>
    ),
    [router]
  );

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar
        title="BudgetBrain"
        subtitle="Income & Cash Flow"
        rightAction={
          <Pressable
            onPress={() => router.push('/income/add')}
            style={({ pressed }) => [styles.headerAddBtn, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="Add income"
          >
            <LinearGradient
              colors={[theme.colors.secondary, '#00A572']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerAddGradient}
            >
              <AppIcon name="add" size={18} color="#003824" />
            </LinearGradient>
          </Pressable>
        }
      />

      <FlatList
        data={isLoading ? [] : filteredTransactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarInset }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refreshAll} tintColor={theme.colors.secondary} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Cash Flow Emerald Hero Banner */}
            <View style={styles.heroCard}>
              <LinearGradient
                colors={['rgba(78, 222, 163, 0.14)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.2, y: 0.8 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={styles.heroGlowCircle} pointerEvents="none" />

              <View style={styles.heroHeaderRow}>
                <View style={styles.heroTitleCluster}>
                  <View style={styles.heroIconPod}>
                    <AppIcon name="income" size={18} color={theme.colors.secondary} />
                  </View>
                  <Text style={styles.heroTitle}>Inflow Cash Stream</Text>
                </View>
                <View style={styles.activeTag}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.activeTagText}>
                    {sourceCount} {sourceCount === 1 ? 'Stream' : 'Streams'} Active
                  </Text>
                </View>
              </View>

              <View style={styles.heroBody}>
                <Text style={styles.heroLabel}>Total Inflow Recorded</Text>
                <Text style={styles.heroAmount} numberOfLines={1}>
                  {formatCurrency(totalEarned, currency)}
                </Text>
              </View>

              <View style={styles.heroFooter}>
                <View style={styles.statPill}>
                  <AppIcon name="trendingUp" size={14} color={theme.colors.secondary} />
                  <Text style={styles.statPillText}>
                    Positive Cashflow · <Text style={{ fontWeight: '700' }}>Active Cycle</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Income Streams Carousel */}
            {sources && sources.length > 0 ? (
              <View style={styles.sourcesSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>INCOME SOURCES</Text>
                  <Text style={styles.sourcesCountText}>{sources.length} Configured</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sourcesScroll}
                >
                  {sources.map((src) => (
                    <View key={src.id} style={styles.sourceCard}>
                      <View style={styles.sourceCardIconPod}>
                        <AppIcon name="wallet" size={16} color={theme.colors.primary} />
                      </View>
                      <Text style={styles.sourceName} numberOfLines={1}>
                        {src.name}
                      </Text>
                      <View style={styles.sourceTypePill}>
                        <Text style={styles.sourceType}>{src.type.replace(/_/g, ' ')}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Filter Chips Rail */}
            <View style={styles.filterChipsWrap}>
              <FilterChipsRail
                chips={filterChips}
                selectedId={activeCategory}
                onSelect={setActiveCategory}
                style={{ paddingHorizontal: 0 }}
              />
            </View>

            {/* Sub-header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Inflows</Text>
              <Text style={styles.sectionCount}>
                {transactionTotal} {transactionTotal === 1 ? 'entry' : 'entries'}
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ListRowsSkeleton count={2} variant="transaction" />
          ) : (
            <View style={styles.footerWrap}>
              <Pressable
                onPress={() => router.push('/income/add')}
                style={({ pressed }) => [styles.createBtnWrap, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient
                  colors={[theme.colors.secondary, '#00A572']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtnGradient}
                >
                  <AppIcon name="add" size={20} color="#003824" />
                  <Text style={styles.createBtnText}>Record Inflow / Income</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={4} variant="transaction" />
          ) : isError ? (
            <EmptyState
              title="Couldn’t load income"
              subtitle="Check your connection and try again"
              icon="income"
              action="Retry"
              onAction={() => void refetch()}
            />
          ) : (
            <EmptyState
              title="No income yet"
              subtitle="Record your first income entry to start tracking inflow"
              icon="income"
              action="Add income"
              onAction={() => router.push('/income/add')}
            />
          )
        }
      />
    </View>
  );
}
