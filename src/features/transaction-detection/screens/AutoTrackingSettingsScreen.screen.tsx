import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '@/shared/theme';
import type { RootState } from '@/shared/store';
import { appHref } from '@/shared/utils/navigation';
import { StackNavHeader } from '@/shared/components/ui';
import { useAutoTrackingSettings } from '../hooks/useAutoTrackingSettings.hook';
import { useHistoricalSync } from '../hooks/useHistoricalSync.hook';
import { SyncStatusPill } from '../components/sync/SyncStatusPill.component';
import { PermissionWarningBanner } from '../components/permission/PermissionWarningBanner.component';
import { AutoTrackingConsentCard } from '../components/settings/AutoTrackingConsentCard.component';
import { PermissionExplainerModal } from '../components/settings/PermissionExplainerModal.component';
import { HistoricalSyncModal } from '../components/settings/HistoricalSyncModal.component';
import { MyAccountsCard } from '../components/settings/MyAccountsCard.component';
import { TemplateLearningRow } from '../components/settings/TemplateLearningRow.component';
import { useOwnAccounts } from '../hooks/useOwnAccounts.hook';
import { createStyles } from './AutoTrackingSettingsScreen.styles';

export function AutoTrackingSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    isEnabled,
    permissionStatus,
    notificationPreference,
    learnedRulesCount,
    isExplainerVisible,
    isHistoricalModalVisible,
    setIsExplainerVisible,
    setIsHistoricalModalVisible,
    handleToggleTracking,
    handleConfirmExplainer,
    openSettings,
    setNotificationPreference,
    handleResetLearning,
    handleDeleteDetectedData,
    isDeletingData,
    autoAddHighConfidence,
    setAutoAddHighConfidence,
    templateLearning,
    isTemplateLearningKnown,
    setTemplateLearning,
  } = useAutoTrackingSettings();
  const ownAccounts = useOwnAccounts();

  const pendingReviewCount = useSelector(
    (state: RootState) => state.transactionDetection.pendingReviewCount
  );
  const lastSyncedAt = useSelector(
    (state: RootState) => state.transactionDetection.lastSyncedAt
  );

  const {
    isScanning,
    processedCount,
    totalMessages,
    queuedCount,
    startScan,
  } = useHistoricalSync();

  const handleNavigateReview = () => {
    router.push(appHref('/transactions/review'));
  };
  const handleNavigateHistory = () => {
    router.push(appHref('/transactions/detected'));
  };

  const isPermissionDenied =
    permissionStatus === 'denied' || permissionStatus === 'blocked';

  return (
    <View style={styles.container}>
      <StackNavHeader title="SMS Auto-Tracking" />

      <ScrollView contentContainerStyle={styles.content}>
        {isEnabled && (
          <SyncStatusPill
            lastSyncAt={lastSyncedAt}
          />
        )}

        {isEnabled && isPermissionDenied && (
          <PermissionWarningBanner
            status={permissionStatus as 'denied' | 'blocked'}
            onActionPress={openSettings}
          />
        )}

        <AutoTrackingConsentCard
          isEnabled={isEnabled}
          autoAddHighConfidence={autoAddHighConfidence}
          notifyOnDetection={notificationPreference !== 'off'}
          onToggleEnabled={handleToggleTracking}
          onToggleAutoAdd={setAutoAddHighConfidence}
          onToggleNotify={(val) =>
            setNotificationPreference(val ? 'all' : 'off')
          }
        />

        {isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.cardGroup}>
              <TouchableOpacity
                style={[styles.actionRow, styles.actionRowBorder]}
                onPress={handleNavigateReview}
                activeOpacity={0.7}
              >
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Pending Review</Text>
                  <Text style={styles.actionSubtitle}>
                    Transactions awaiting your confirmation
                  </Text>
                </View>
                {pendingReviewCount > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{pendingReviewCount}</Text>
                  </View>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionRow, styles.actionRowBorder]}
                onPress={handleNavigateHistory}
                activeOpacity={0.7}
              >
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Detected Transactions</Text>
                  <Text style={styles.actionSubtitle}>
                    Added automatically or by you, with undo
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionRow, styles.actionRowBorder]}
                onPress={() => setIsHistoricalModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Scan Past Messages</Text>
                  <Text style={styles.actionSubtitle}>
                    Scan historical SMS inbox for earlier transactions
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleResetLearning}
                activeOpacity={0.7}
              >
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Learned Preferences</Text>
                  <Text style={styles.actionSubtitle}>
                    {learnedRulesCount} merchant categorization rules saved
                  </Text>
                </View>
                <Text style={styles.actionDanger}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Accounts</Text>
            <MyAccountsCard
              ownAccountTails={ownAccounts.ownAccountTails}
              linkedAccountTails={ownAccounts.linkedAccountTails}
              ownVpas={ownAccounts.ownVpas}
              tailDraft={ownAccounts.tailDraft}
              vpaDraft={ownAccounts.vpaDraft}
              error={ownAccounts.error}
              onChangeTail={ownAccounts.setTailDraft}
              onChangeVpa={ownAccounts.setVpaDraft}
              onSubmitTail={ownAccounts.submitTail}
              onSubmitVpa={ownAccounts.submitVpa}
              onRemoveTail={ownAccounts.removeTail}
              onRemoveVpa={ownAccounts.removeVpa}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.cardGroup}>
            <TemplateLearningRow
              value={templateLearning}
              disabled={!isTemplateLearningKnown}
              onToggle={setTemplateLearning}
            />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleDeleteDetectedData}
              disabled={isDeletingData}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Delete My Detected Data</Text>
                <Text style={styles.actionSubtitle}>
                  Removes detections on this phone and on our servers. Added transactions stay.
                </Text>
              </View>
              <Text style={styles.actionDanger}>{isDeletingData ? 'Deleting…' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <PermissionExplainerModal
        visible={isExplainerVisible}
        isPermanentlyDenied={permissionStatus === 'blocked'}
        onConfirm={handleConfirmExplainer}
        onDismiss={() => setIsExplainerVisible(false)}
      />

      <HistoricalSyncModal
        visible={isHistoricalModalVisible}
        isSyncing={isScanning}
        progress={{
          total: totalMessages,
          processed: processedCount,
          detected: queuedCount,
        }}
        onStartSync={startScan}
        onDismiss={() => setIsHistoricalModalVisible(false)}
      />
    </View>
  );
}
