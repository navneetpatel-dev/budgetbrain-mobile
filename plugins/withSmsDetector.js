const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const SMS_PERMISSIONS = ['android.permission.RECEIVE_SMS', 'android.permission.READ_SMS'];
const RECEIVER = 'app.budgetbrain.smsdetector.SmsReceiver';

/**
 * Wires the `modules/sms-detector` receiver into the app manifest (plan T2.1).
 *
 * The SMS permissions and the receiver live here, not in app.json or the module's own
 * manifest, so one switch gives the `noSms` variant (plan T2.11) in case Google Play rejects
 * the SMS permission declaration: set BUDGETBRAIN_NO_SMS=1 (the `production-nosms` EAS
 * profile does) or pass `{ enabled: false }`. That build ships no SMS permission at all, and
 * the app falls back to manual entry.
 */
function withSmsDetector(config, props = {}) {
  const enabled = props.enabled !== false && process.env.BUDGETBRAIN_NO_SMS !== '1';

  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    manifest.manifest.$['xmlns:tools'] = manifest.manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    const permissions = (manifest.manifest['uses-permission'] || []).filter(
      (entry) => !SMS_PERMISSIONS.includes(entry.$['android:name'])
    );
    app.receiver = (app.receiver || []).filter((entry) => entry.$['android:name'] !== RECEIVER);

    if (enabled) {
      for (const name of SMS_PERMISSIONS) permissions.push({ $: { 'android:name': name } });
      app.receiver.push({
        $: {
          'android:name': RECEIVER,
          'android:exported': 'true',
          // Only the system (which holds BROADCAST_SMS) can deliver to this receiver.
          'android:permission': 'android.permission.BROADCAST_SMS',
        },
        'intent-filter': [
          {
            $: { 'android:priority': '999' },
            action: [{ $: { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' } }],
          },
        ],
      });
    } else {
      // Strip the permissions even if a library manifest declares them.
      for (const name of SMS_PERMISSIONS) permissions.push({ $: { 'android:name': name, 'tools:node': 'remove' } });
    }

    manifest.manifest['uses-permission'] = permissions;
    return mod;
  });
}

module.exports = withSmsDetector;
