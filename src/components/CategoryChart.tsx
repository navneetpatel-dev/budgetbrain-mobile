import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '@/src/constants/config';
import type { Category } from '@/src/types';

interface Props {
  data: Array<{ categoryId: string; total: string; category?: Category }>;
  currency: string;
}

const FALLBACK_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function CategoryChart({ data, currency }: Props) {
  if (!data.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No spending data yet</Text>
      </View>
    );
  }

  const symbol = currency === 'INR' ? '₹' : currency;
  const sorted = [...data]
    .map((item, index) => ({
      name: item.category?.name ?? 'Other',
      total: Number(item.total),
      color: item.category?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const max = Math.max(...sorted.map((d) => d.total), 1);

  return (
    <View style={styles.container}>
      {sorted.map((item) => (
        <View key={item.name} style={styles.row}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.amount}>
              {symbol}{item.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[styles.barFill, { width: `${(item.total / max) * 100}%`, backgroundColor: item.color }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8, gap: 12 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  row: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  amount: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  barTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});
