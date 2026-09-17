import { useMemo, useState } from 'react';
import { StyleSheet, View, RefreshControl, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  EmptyState,
  ListRowsSkeleton,
  AppHeaderBar,
  FilterChipsRail,
  type FilterChipItem,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useInfinitePaginatedList, usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { IncomeSource, Transaction } from '@/shared/types';

export default function IncomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const {
    items: transactions,
    total: transactionTotal,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePaginatedList<Transaction>({
    queryKey: ['income'],
    url: '/income',
    itemsKey: 'transactions',
    pageSize: 20,
  });

  const { data: sources, refetch: refetchSources } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources'],
    url: '/income/sources',
    itemsKey: 'sources',
  });

  const sourceCount = sources?.length ?? 0;

  // Calculate total monthly income
  const { totalEarned, currency } = useMemo(() => {
    let sum = 0;
    let curr = 'INR';
    (transactions ?? []).forEach((t) => {
      curr = t.currency || curr;
      sum += Number(t.amount) || 0;
    });
    return { totalEarned: sum, currency: curr };
  }, [transactions]);

  // Dynamic filter chips from sources
  const filterChips: FilterChipItem[] = useMemo(() => {
    const chips: FilterChipItem[] = [
      { id: 'all', label: `All (${transactionTotal || 0})` },
    ];
    (sources ?? []).forEach((s) => {
      chips.push({ id: s.id, label: s.name });
    });
    return chips;
  }, [sources, transactionTotal]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (activeCategory === 'all') return transactions;
    return transactions.filter(
      (t) =>
        t.incomeSourceId === activeCategory ||
        t.category?.id === activeCategory ||
        t.category?.name === activeCategory,
    );
  }, [transactions, activeCategory]);

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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
              refetchSources();
            }}
            tintColor={theme.colors.secondary}
          />
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
            <View style={{ marginTop: tSpacing(theme, 4) }}>
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
        renderItem={({ item, index }) => (
          <TransactionGroup>
            <TransactionItem
              transaction={item}
              onPress={() => router.push(appHref(`/income/${item.id}`))}
              showBadge
              isFirst
              isLast
            />
          </TransactionGroup>
        )}
      />
    </View>
  );
}

function tSpacing(t: ReturnType<typeof useTheme>, step: number) {
  return t.spacing.sm * (step / 2);
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    headerAddBtn: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    headerAddGradient: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: 120,
    },
    headerBlock: {
      marginBottom: t.spacing.md,
    },
    heroCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 20,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
      marginBottom: t.spacing.md,
    },
    heroGlowCircle: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(78, 222, 163, 0.10)',
    },
    heroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    heroTitleCluster: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    heroIconPod: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.15)' : 'rgba(78, 222, 163, 0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    activeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.12)' : t.colors.secondaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(78, 222, 163, 0.28)' : 'transparent',
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.secondary,
    },
    activeTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    heroBody: {
      marginBottom: 14,
    },
    heroLabel: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    heroAmount: {
      ...t.typography.amount,
      fontSize: 32,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.8,
    },
    heroFooter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.08)' : 'rgba(78, 222, 163, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statPillText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textSecondary,
    },
    sourcesSection: {
      marginTop: 4,
      marginBottom: 8,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: t.spacing.sm,
      marginBottom: t.spacing.xs,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: t.colors.textTertiary,
    },
    sourcesCountText: {
      fontSize: 11,
      color: t.colors.textTertiary,
      fontWeight: '500',
    },
    sourcesScroll: {
      gap: 10,
      paddingVertical: 6,
    },
    sourceCard: {
      width: 130,
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    sourceCardIconPod: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.12)' : 'rgba(14, 165, 233, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    sourceName: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 4,
    },
    sourceTypePill: {
      alignSelf: 'flex-start',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    sourceType: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      textTransform: 'capitalize',
      fontSize: 10,
      fontWeight: '600',
    },
    sectionTitle: {
      ...t.typography.titleSm,
      fontSize: 17,
      fontWeight: '700',
      color: t.colors.text,
    },
    sectionCount: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontWeight: '600',
    },
    separator: {
      height: 8,
    },
    footerWrap: {
      marginTop: t.spacing.lg,
    },
    createBtnWrap: {
      borderRadius: 14,
      overflow: 'hidden',
    },
    createBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    createBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#003824',
      letterSpacing: -0.2,
    },
  });
}
