import { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeaderBar, DateInput } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useExportReports } from '@/features/reports/hooks/useExportReports';
import { useEntitlement, PaywallModal } from '@/features/subscriptions';
import { DateBounds } from '@/shared/utils/dateBounds';
import { useTheme } from '@/shared/theme';
import { useBottomSafeInset } from '@/shared/hooks/useLayout';
import { createStyles } from './ReportsScreen.styles';

export function ReportsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottomSafe = useBottomSafeInset();
  const { isEntitled, paywallVisible, openPaywall, closePaywall } = useEntitlement();
  const { startDate, setStartDate, endDate, setEndDate, loading, downloadCsv, downloadPdf, downloadExcel } = useExportReports();

  const handleDownloadCsv = () => {
    downloadCsv();
  };

  const handleDownloadExcel = () => {
    if (!isEntitled) {
      openPaywall();
      return;
    }
    downloadExcel();
  };

  const handleDownloadPdf = () => {
    if (!isEntitled) {
      openPaywall();
      return;
    }
    downloadPdf();
  };
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

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomSafe + theme.spacing.xl }]}>
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
            onPress={handleDownloadCsv}
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

          {/* Excel Download Button */}
          <Pressable
            onPress={handleDownloadExcel}
            disabled={loading}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.formatIconPod, { backgroundColor: theme.colors.success + '18' }]}>
              <AppIcon name="document" size={20} color={theme.colors.success} />
            </View>
            <View style={styles.formatTextCol}>
              <Text style={styles.formatTitle}>
                Spreadsheet (Excel) {!isEntitled ? '★ PRO' : ''}
              </Text>
              <Text style={styles.formatDesc}>Formatted workbook with financial metrics (.xlsx)</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.success} />
            ) : (
              <AppIcon name="chevronRight" size={16} color={theme.colors.textTertiary} />
            )}
          </Pressable>

          {/* PDF Download Button */}
          <Pressable
            onPress={handleDownloadPdf}
            disabled={loading}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.formatIconPod, { backgroundColor: theme.colors.rose + '18' }]}>
              <AppIcon name="reports" size={20} color={theme.colors.rose} />
            </View>
            <View style={styles.formatTextCol}>
              <Text style={styles.formatTitle}>
                Executive Summary (PDF) {!isEntitled ? '★ PRO' : ''}
              </Text>
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

      <PaywallModal
        visible={paywallVisible}
        onClose={closePaywall}
        featureTitle="Unlock High-Res Financial Statements"
      />
    </View>
  );
}

