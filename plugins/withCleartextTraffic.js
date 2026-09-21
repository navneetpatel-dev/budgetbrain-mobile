const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
</network-security-config>
`;

/**
 * Expo 56 only enables cleartext HTTP on debug manifests. Release APKs then
 * block `http://` API hosts (Android 9+) even when app.json sets
 * `android.usesCleartextTraffic`. This plugin writes it onto the main
 * application so sideloaded release builds can reach the current HTTP API.
 */
function withCleartextTraffic(config) {
  config = withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    app.$['android:usesCleartextTraffic'] = 'true';
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return mod;
  });

  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const xmlDir = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      await fs.promises.mkdir(xmlDir, { recursive: true });
      await fs.promises.writeFile(path.join(xmlDir, 'network_security_config.xml'), NETWORK_SECURITY_CONFIG);
      return mod;
    },
  ]);

  return config;
}

module.exports = withCleartextTraffic;
