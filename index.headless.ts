import { AppRegistry } from 'react-native';

/**
 * Registers the detection drain as a headless JS task (plan T2.5). The task module is required
 * lazily, so an app start that never runs the task doesn't load it, and a headless run loads
 * only the detection store, the pipeline and the sync manager, never the React tree.
 */
AppRegistry.registerHeadlessTask('TransactionDetectionDrain', () => () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./src/features/transaction-detection/services/headlessDrain.task').runHeadlessDetectionDrain()
);
