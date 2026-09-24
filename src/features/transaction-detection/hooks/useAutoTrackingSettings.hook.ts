import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { updateDetectionSettings } from '../api/detectedTransactions.api';
import { getDetectionConfig, setCachedDetectionConfig } from '../services/detectionConfig.service';

const PERMISSION_KEY = ['sms-permission'] as const;
const CONFIG_KEY = ['detected-transactions', 'config'] as const;

export function useAutoTrackingSettings() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const detection = useSelector((state: RootState) => state.transactionDetection);
  const [isExplainerVisible, setIsExplainerVisible] = useState(false);
  const [isHistoricalModalVisible, setIsHistoricalModalVisible] = useState(false);

  const permission = useQuery({ queryKey: PERMISSION_KEY, queryFn: checkSmsPermissions });
  const permissionStatus: PermissionCheckResult = permission.data ?? 'unsupported';

  // Server kill switches and the user's auto-add preference (plan tasks T1.16, T1.5).
  const config = useQuery({ queryKey: CONFIG_KEY, queryFn: () => getDetectionConfig({ force: true }) });
  const autoAdd = useMutation({
    mutationFn: (value: boolean) => updateDetectionSettings({ autoAddHighConfidence: value }),
    onSuccess: (next) => {
      setCachedDetectionConfig(next);
      queryClient.setQueryData(CONFIG_KEY, next);
    },
  });

  const handleToggleTracking = async (value: boolean) => {
    if (!value) {
      dispatch(setAutoTrackingEnabled(false));
      return;
    }
    const currentStatus = await checkSmsPermissions();
    queryClient.setQueryData(PERMISSION_KEY, currentStatus);
    if (currentStatus === 'granted') {
      dispatch(setAutoTrackingEnabled(true));
      return;
    }
    // Explain before asking for the system permission (spec §23).
    setIsExplainerVisible(true);
  };

  const handleConfirmExplainer = async () => {
    setIsExplainerVisible(false);
    const result = await requestSmsPermissions();
    queryClient.setQueryData(PERMISSION_KEY, result);
    if (result === 'granted') {
      dispatch(setAutoTrackingEnabled(true));
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
    serverDetectionEnabled: config.data?.enabled ?? true,
    autoAddHighConfidence: autoAdd.isPending ? autoAdd.variables : (config.data?.autoAddHighConfidence ?? true),
    setAutoAddHighConfidence: (value: boolean) => autoAdd.mutate(value),
    isExplainerVisible,
    isHistoricalModalVisible,
    setIsExplainerVisible,
    setIsHistoricalModalVisible,
    handleToggleTracking,
    handleConfirmExplainer,
    openSettings: openAppSettings,
    refreshPermission: () => permission.refetch(),
    setNotificationPreference: (pref: 'all' | 'needs_review' | 'off') => dispatch(setNotificationPreference(pref)),
    setSelectedSimSlot: (slot: 'all' | '1' | '2') => dispatch(setSelectedSimSlot(slot)),
    addExcludedMerchant: (m: string) => dispatch(addExcludedMerchant(m)),
    removeExcludedMerchant: (m: string) => dispatch(removeExcludedMerchant(m)),
    addExcludedAccountTail: (tail: string) => dispatch(addExcludedAccountTail(tail)),
    removeExcludedAccountTail: (tail: string) => dispatch(removeExcludedAccountTail(tail)),
    resetLearnedRules: () => dispatch(resetLearnedRules()),
  };
}
