import { useEffect, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/shared/store';
import {
  setAutoTrackingEnabled,
  setAppNotificationCapture,
  setNotificationPreference,
  setSelectedSimSlot,
  addExcludedMerchant,
  removeExcludedMerchant,
  addExcludedAccountTail,
  removeExcludedAccountTail,
  setAutoAddHighConfidence,
  setPendingReviewCount,
} from '@/shared/store/transactionDetectionSlice';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import {
  checkSmsPermissions,
  requestSmsPermissions,
  openAppSettings,
  type PermissionCheckResult,
} from '@/shared/services/sms/smsPermission.service';
import {
  isNotificationAccessGranted,
  isNotificationListenerSupported,
  openNotificationAccessSettings,
} from '@/shared/services/sms/smsDetector.service';
import { deleteMyDetectedData, updateDetectionSettings } from '../api/detectedTransactions.api';
import { clearDetectionData, clearSkeletons } from '../services/store/detectionStore.service';
import { resetMerchantRules } from '../services/detectionProfile.service';
import { getDetectionConfig, setCachedDetectionConfig } from '../services/detectionConfig.service';
import { apiTransport } from '../services/transport/apiTransport';

const PERMISSION_KEY = ['sms-permission'] as const;
const CONFIG_KEY = ['detected-transactions', 'config'] as const;
const NOTIFICATION_ACCESS_KEY = ['notification-access'] as const;

export function useAutoTrackingSettings() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const detection = useSelector((state: RootState) => state.transactionDetection);
  const [isExplainerVisible, setIsExplainerVisible] = useState(false);
  const [isHistoricalModalVisible, setIsHistoricalModalVisible] = useState(false);
  const [isNotificationExplainerVisible, setIsNotificationExplainerVisible] = useState(false);

  // Bank-app notifications (plan T8.1): Android builds that declare the listener. Access is
  // granted in system Settings, so it is read again whenever the user comes back to the app.
  const notificationSupported = Platform.OS === 'android' && isNotificationListenerSupported();
  const notificationAccess = useQuery({
    queryKey: NOTIFICATION_ACCESS_KEY,
    queryFn: async () => isNotificationAccessGranted(),
    enabled: notificationSupported,
  });
  useEffect(() => {
    if (!notificationSupported) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void queryClient.invalidateQueries({ queryKey: NOTIFICATION_ACCESS_KEY });
    });
    return () => sub.remove();
  }, [notificationSupported, queryClient]);
  const notificationAccessGranted = notificationAccess.data ?? false;
  // Persisted state from before T8.1 has no such key.
  const appNotificationCapture = detection.appNotificationCaptureEnabled ?? false;

  const permission = useQuery({ queryKey: PERMISSION_KEY, queryFn: checkSmsPermissions });
  const permissionStatus: PermissionCheckResult = permission.data ?? 'unsupported';

  // Server kill switches and the user's auto-add preference (plan tasks T1.16, T1.5).
  const config = useQuery({ queryKey: CONFIG_KEY, queryFn: () => getDetectionConfig(apiTransport, { force: true }) });
  const autoAdd = useMutation({
    mutationFn: (value: boolean) => updateDetectionSettings({ autoAddHighConfidence: value }),
    onSuccess: (next) => {
      void setCachedDetectionConfig(next);
      queryClient.setQueryData(CONFIG_KEY, next);
      dispatch(setAutoAddHighConfidence(next.autoAddHighConfidence));
    },
  });

  // Template learning (T7.4, D-5): off by default; turning it off drops shapes not yet sent,
  // and the server deletes what it holds.
  const templateLearning = useMutation({
    mutationFn: async (value: boolean) => {
      const next = await updateDetectionSettings({ templateLearning: value });
      if (!value) await clearSkeletons().catch(() => {});
      return next;
    },
    onSuccess: (next) => {
      void setCachedDetectionConfig(next);
      queryClient.setQueryData(CONFIG_KEY, next);
    },
    onError: (error) => Alert.alert('Could not save', getApiErrorMessage(error, 'Try again when you are online.')),
  });

  // Keep the last known server value, so the switch is right offline and on the next launch (T5.7).
  const serverAutoAdd = config.data?.autoAddHighConfidence;
  useEffect(() => {
    if (serverAutoAdd !== undefined) dispatch(setAutoAddHighConfidence(serverAutoAdd));
  }, [dispatch, serverAutoAdd]);

  // Removes every detected transaction the server holds and this device's unsent queue (T5.7).
  // Transactions already added to the ledger stay; they are the user's records now.
  const deleteData = useMutation({
    mutationFn: async () => {
      const result = await deleteMyDetectedData();
      await clearDetectionData();
      return result;
    },
    onSuccess: () => {
      dispatch(setPendingReviewCount(0));
      void queryClient.invalidateQueries({ queryKey: ['detected-transactions'] });
      invalidateMoneyQueries(queryClient);
    },
    onError: (error) => Alert.alert('Could not delete', getApiErrorMessage(error, 'Try again when you are online.')),
  });

  const resetRules = useMutation({
    mutationFn: resetMerchantRules,
    onError: (error) => Alert.alert('Could not reset', getApiErrorMessage(error, 'Try again when you are online.')),
  });

  const handleResetLearning = () => {
    Alert.alert(
      'Reset learned preferences',
      'This removes every merchant-to-category rule learned from your corrections, on this phone and on our servers.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetRules.mutate() },
      ]
    );
  };

  const handleDeleteDetectedData = () => {
    Alert.alert(
      'Delete detected data',
      'This deletes every detected transaction waiting for review or in your detection history, on this phone and on our servers. Transactions you already added stay in your ledger.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteData.mutate() },
      ]
    );
  };

  const handleToggleTracking = async (value: boolean) => {
    if (!value) {
      dispatch(setAutoTrackingEnabled(false));
      // Turning tracking off drops what this device detected but hasn't sent (T5.7).
      void clearDetectionData().catch(() => {});
      void queryClient.invalidateQueries({ queryKey: ['detected-transactions', 'local'] });
      return;
    }
    const currentStatus = await checkSmsPermissions();
    queryClient.setQueryData(PERMISSION_KEY, currentStatus);
    if (currentStatus === 'granted') {
      dispatch(setAutoTrackingEnabled(true));
      return;
    }
    if (currentStatus === 'unsupported' && notificationSupported) {
      // The noSms build (plan T2.11) can still track through bank-app notifications (T8.1).
      dispatch(setAutoTrackingEnabled(true));
      dispatch(setAppNotificationCapture(true));
      if (!notificationAccessGranted) setIsNotificationExplainerVisible(true);
      return;
    }
    if (currentStatus === 'unsupported') {
      // iOS, Expo Go, or the noSms build (plan T2.11): there is no permission to ask for.
      Alert.alert('Not available', "Automatic SMS tracking isn't available in this version of the app. You can still add transactions manually.");
      return;
    }
    // Explain before asking for the system permission (spec §23).
    setIsExplainerVisible(true);
  };

  const handleToggleNotificationCapture = (value: boolean) => {
    dispatch(setAppNotificationCapture(value));
    if (value && !notificationAccessGranted) setIsNotificationExplainerVisible(true);
  };

  const handleConfirmNotificationExplainer = () => {
    setIsNotificationExplainerVisible(false);
    openNotificationAccessSettings();
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
    autoAddHighConfidence: autoAdd.isPending ? autoAdd.variables : (serverAutoAdd ?? detection.autoAddHighConfidence),
    setAutoAddHighConfidence: (value: boolean) => autoAdd.mutate(value),
    templateLearning: templateLearning.isPending ? templateLearning.variables : (config.data?.templateLearning ?? false),
    isTemplateLearningKnown: config.data !== undefined && config.data !== null,
    setTemplateLearning: (value: boolean) => templateLearning.mutate(value),
    isExplainerVisible,
    isHistoricalModalVisible,
    // iPhones can't read SMS or other apps' notifications (plan T8.4).
    isIos: Platform.OS === 'ios',
    notificationSupported,
    appNotificationCapture,
    notificationAccessGranted,
    handleToggleNotificationCapture,
    isNotificationExplainerVisible,
    handleConfirmNotificationExplainer,
    dismissNotificationExplainer: () => setIsNotificationExplainerVisible(false),
    openNotificationAccessSettings,
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
    handleResetLearning,
    handleDeleteDetectedData,
    isDeletingData: deleteData.isPending,
  };
}
