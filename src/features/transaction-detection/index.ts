// Public API barrel for transaction-detection feature

// Types
export * from './types/transactionDetection.types';

// Constants
export * from './constants/transactionDetection.constants';
export * from './constants/institutionKeywords';
export * from './constants/merchantCatalog';

// Engines
export * from './engines/eligibility.engine';
export * from './engines/detector.engine';
export * from './engines/extractor.engine';
export * from './engines/classifier.engine';
export * from './engines/merchant.engine';
export * from './engines/category.engine';
export * from './engines/confidence.engine';
export * from './engines/duplicate.engine';
export * from './engines/validator.engine';

// Services
export * from './services/transactionPipeline.service';
export * from './services/historicalSync.service';
export * from './services/detectionSync.service';
export * from './services/syncManager.service';
export * from './services/detectionContext.service';
export * from './services/detectionConfig.service';

// Hooks
export * from './hooks/useAutoTrackingSettings.hook';
export * from './hooks/useDetectedTransactionsReview.hook';
export * from './hooks/useHistoricalSync.hook';
export * from './hooks/useTransactionDetectionPipeline.hook';

// Components
export { AutoDetectedBadge } from './components/badge/AutoDetectedBadge.component';
export { SyncStatusPill } from './components/sync/SyncStatusPill.component';
export { PermissionWarningBanner } from './components/permission/PermissionWarningBanner.component';
export { DetectedTransactionRow } from './components/review/DetectedTransactionRow.component';
export { DetectedTransactionList } from './components/review/DetectedTransactionList.component';
export { AutoTrackingConsentCard } from './components/settings/AutoTrackingConsentCard.component';
export { PermissionExplainerModal } from './components/settings/PermissionExplainerModal.component';
export { HistoricalSyncModal } from './components/settings/HistoricalSyncModal.component';

// Screens
export { AutoTrackingSettingsScreen } from './screens/AutoTrackingSettingsScreen.screen';
export { DetectedTransactionsReviewScreen } from './screens/DetectedTransactionsReviewScreen.screen';
