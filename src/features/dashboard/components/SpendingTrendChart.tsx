import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { SpendingTrends, SpendingTrendPoint } from '@/shared/types';

interface Props {
  trends?: SpendingTrends;
  currency: string;
}

type IntervalMode = 'daily' | 'weekly' | 'monthly';

export function SpendingTrendChart({ trends, currency }: Props) {
  const theme = useTheme();
  const [mode, setMode] = useState<IntervalMode>('daily');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const points: SpendingTrendPoint[] = trends?.[mode] ?? [];
  const maxVal = useMemo(
    () => Math.max(...points.map((p) => p.total), 0),
    [points],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: theme.spacing.lg,
          borderRadius: theme.radii.card,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        title: {
          fontWeight: '700',
          fontSize: 15,
          color: theme.colors.text,
        },
        pillContainer: {
          flexDirection: 'row',
          backgroundColor: theme.colors.surfaceContainer,
          padding: 2,
          borderRadius: 8,
        },
        pillBtn: {
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 6,
        },
        pillActive: {
          backgroundColor: theme.colors.primary,
        },
        pillText: {
          fontWeight: '500',
          fontSize: 11,
          color: theme.colors.textSecondary,
        },
        pillTextActive: {
          color: theme.colors.onPrimary,
          fontWeight: '700',
        },
        chartBox: {
          height: 120,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderColor: theme.colors.borderSubtle,
          position: 'relative',
        },
        barCol: {
          flex: 1,
          alignItems: 'center',
          height: '100%',
          justifyContent: 'flex-end',
        },
        bar: {
          width: mode === 'monthly' ? 24 : mode === 'weekly' ? 16 : 8,
          borderRadius: 3,
          backgroundColor: theme.colors.primary,
        },
        xLabel: {
          position: 'absolute',
          bottom: -18,
          fontSize: 9,
          fontWeight: '400',
          color: theme.colors.textTertiary,
        },
        tooltip: {
          marginTop: theme.spacing.sm,
          alignItems: 'center',
        },
        tooltipText: {
          fontSize: 12,
          fontWeight: '500',
          color: theme.colors.textSecondary,
        },
        tooltipValue: {
          fontWeight: '700',
          color: theme.colors.text,
        },
        empty: {
          paddingVertical: theme.spacing.lg,
          alignItems: 'center',
        },
        emptyText: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.colors.textSecondary,
          marginTop: 6,
        },
      }),
    [theme, mode],
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppIcon name="trendingUp" size={16} color={theme.colors.primary} />
          <Text style={styles.title}>Spending Trends</Text>
        </View>

        <View style={styles.pillContainer}>
          {(['daily', 'weekly', 'monthly'] as IntervalMode[]).map((tab) => {
            const isActive = mode === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  setMode(tab);
                  setSelectedIdx(null);
                }}
                style={[styles.pillBtn, isActive && styles.pillActive]}
                accessibilityRole="button"
                accessibilityLabel={`${tab} spending trends`}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {tab === 'daily' ? '14D' : tab === 'weekly' ? '8W' : '6M'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {points.length === 0 || maxVal === 0 ? (
        <View style={styles.empty}>
          <AppIcon name="chart" size={24} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>No spending activity in this period</Text>
        </View>
      ) : (
        <View>
          <View style={styles.chartBox}>
            {points.map((pt, idx) => {
              const heightPct = Math.max(toSafePercent(pt.total, maxVal), 4);
              const isSelected = selectedIdx === idx;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedIdx(idx)}
                  style={styles.barCol}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: isSelected
                          ? theme.colors.secondary
                          : pt.total > 0
                          ? theme.colors.primary
                          : theme.colors.borderSubtle,
                      },
                    ]}
                  />
                  <Text style={styles.xLabel} numberOfLines={1}>
                    {pt.label.slice(0, 4)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedIdx != null && points[selectedIdx] && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {points[selectedIdx].label}:{' '}
                <Text style={styles.tooltipValue}>
                  {formatCurrency(points[selectedIdx].total, currency)}
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
