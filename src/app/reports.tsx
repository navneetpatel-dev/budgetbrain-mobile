import { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeaderBar, DateInput } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useExportReports } from '@/features/reports/hooks/useExportReports';
import { DateBounds } from '@/shared/utils/dateBounds';
import { useTheme } from '@/shared/theme';

export default function ReportsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { startDate, setStartDate, endDate, setEndDate, loading, downloadCsv, downloadPdf } = useExportReports();
  const fromBounds = DateBounds.rangeFrom(endDate, startDate);
  const toBounds = DateBounds.rangeTo(startDate, endDate);

  return (
    <View style={styles.root}>
      <AppHeaderBar
        title="Export Reports"
        subtitle="Financial Statements & Tax Logs"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['rgba(14, 165, 233, 0.12)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.infoIconPod}>
            <AppIcon name="reports" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.infoTextCol}>
            <Text style={styles.infoTitle}>Statement Generator</Text>
            <Text style={styles.infoSubtitle}>
              Generate high-resolution PDF statements or raw CSV exports of all your inflows, outflows, and category breakdowns.
            </Text>
          </View>
        </View>

        {/* Date Range Configuration */}
        <View style={styles.configCard}>
          <Text style={styles.sectionHeader}>SELECT TIMEFRAME</Text>
          <Text style={styles.sectionHint}>Leave dates empty to export your complete transaction ledger.</Text>

          <View style={styles.inputsRow}>
            <DateInput
              label="Start date"
              value={startDate}
              onChange={(next) => {
                setStartDate(next);
                if (endDate && next && endDate < next) setEndDate(next);
              }}
              disabled={loading}
              minimumDate={fromBounds.minimumDate}
              maximumDate={fromBounds.maximumDate}
            />
            <DateInput
              label="End date"
              value={endDate}
              onChange={setEndDate}
              disabled={loading}
              minimumDate={toBounds.minimumDate}
              maximumDate={toBounds.maximumDate}
            />
          </View>
        </View>

        {/* Export Buttons */}
        <View style={styles.actionsBlock}>
          <Text style={styles.sectionHeader}>EXPORT FORMATS</Text>

          {/* CSV Download Button */}
          <Pressable
            onPress={downloadCsv}
            disabled={loading}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.formatIconPod, { backgroundColor: theme.colors.primary + '18' }]}>
              <AppIcon name="category" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.formatTextCol}>
              <Text style={styles.formatTitle}>Spreadsheet (CSV)</Text>
              <Text style={styles.formatDesc}>Raw data compatible with Excel, Google Sheets, & Numbers</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <AppIcon name="chevronRight" size={16} color={theme.colors.textTertiary} />
            )}
          </Pressable>

          {/* PDF Download Button */}
          <Pressable
            onPress={downloadPdf}
            disabled={loading}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.formatIconPod, { backgroundColor: theme.colors.rose + '18' }]}>
              <AppIcon name="reports" size={20} color={theme.colors.rose} />
            </View>
            <View style={styles.formatTextCol}>
              <Text style={styles.formatTitle}>Executive Summary (PDF)</Text>
              <Text style={styles.formatDesc}>Formatted report with category charts and spending breakdown</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.rose} />
            ) : (
              <AppIcon name="chevronRight" size={16} color={theme.colors.textTertiary} />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: 80,
      gap: t.spacing.md,
    },
    infoCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    infoIconPod: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoTextCol: {
      flex: 1,
    },
    infoTitle: {
      ...t.typography.bodySemibold,
      fontSize: 15,
      fontWeight: '700',
      color: t.colors.text,
      marginBottom: 3,
    },
    infoSubtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      lineHeight: 18,
      fontSize: 12,
    },
    configCard: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 18,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: t.colors.textTertiary,
      marginBottom: 2,
    },
    sectionHint: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontSize: 12,
      marginBottom: 16,
    },
    inputsRow: {
      gap: 12,
    },
    actionsBlock: {
      gap: 10,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    formatIconPod: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    formatTextCol: {
      flex: 1,
    },
    formatTitle: {
      ...t.typography.bodySemibold,
      fontSize: 14,
      fontWeight: '700',
      color: t.colors.text,
    },
    formatDesc: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
  });
}
