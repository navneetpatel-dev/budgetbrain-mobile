import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/shared/store';
import {
  setAutoTrackingEnabled,
  setNotificationPreference,
  setSelectedSimSlot,
  addExcludedMerchant,
  removeExcludedMerchant,
  addExcludedAccountTail,
  removeExcludedAccountTail,
  resetLearnedRules,
} from '@/shared/store/transactionDetectionSlice';
import {
  checkSmsPermissions,
  requestSmsPermissions,
  openAppSettings,
  type PermissionCheckResult,
} from '@/shared/services/sms/smsPermission.service';

export function useAutoTrackingSettings() {
  const dispatch = useDispatch();
  const detection = useSelector((state: RootState) => state.transactionDetection);
  const [permissionStatus, setPermissionStatus] = useState<PermissionCheckResult>('unsupported');
  const [isExplainerVisible, setIsExplainerVisible] = useState(false);
  const [isHistoricalModalVisible, setIsHistoricalModalVisible] = useState(false);

  const refreshPermission = useCallback(async () => {
    const status = await checkSmsPermissions();
    setPermissionStatus(status);
  }, []);

  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  const handleToggleTracking = async (value: boolean) => {
    if (!value) {
      dispatch(setAutoTrackingEnabled(false));
      return;
    }

    // If enabling, verify permission
    const currentStatus = await checkSmsPermissions();
    if (currentStatus === 'granted') {
      dispatch(setAutoTrackingEnabled(true));
      return;
    }

    // Show explainer modal before requesting system permission
    setIsExplainerVisible(true);
  };

  const handleConfirmExplainer = async () => {
    setIsExplainerVisible(false);
    const result = await requestSmsPermissions();
    setPermissionStatus(result);

    if (result === 'granted') {
      dispatch(setAutoTrackingEnabled(true));
      // Offer historical scan on initial setup
      setIsHistoricalModalVisible(true);
    }
  };

  return {
    isEnabled: detection.isAutoTrackingEnabled,
    permissionStatus,
    notificationPreference: detection.notificationPreference,
    selectedSimSlot: detection.selectedSimSlot,
    excludedMerchants: detection.excludedMerchants,
    excludedAccountTails: detection.excludedAccountTails,
    learnedRulesCount: Object.keys(detection.learnedRules).length,
    isExplainerVisible,
    isHistoricalModalVisible,
    setIsExplainerVisible,
    setIsHistoricalModalVisible,
    handleToggleTracking,
    handleConfirmExplainer,
    openSettings: openAppSettings,
    refreshPermission,
    setNotificationPreference: (pref: 'all' | 'needs_review' | 'off') =>
      dispatch(setNotificationPreference(pref)),
    setSelectedSimSlot: (slot: 'all' | '1' | '2') => dispatch(setSelectedSimSlot(slot)),
    addExcludedMerchant: (m: string) => dispatch(addExcludedMerchant(m)),
    removeExcludedMerchant: (m: string) => dispatch(removeExcludedMerchant(m)),
    addExcludedAccountTail: (tail: string) => dispatch(addExcludedAccountTail(tail)),
    removeExcludedAccountTail: (tail: string) => dispatch(removeExcludedAccountTail(tail)),
    resetLearnedRules: () => dispatch(resetLearnedRules()),
  };
}
