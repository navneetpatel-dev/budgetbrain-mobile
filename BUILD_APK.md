# Build an Android APK for a physical device

Use this when you want a sideloadable BudgetBrain APK (not Expo Go).

The APK bakes in `EXPO_PUBLIC_*` values from `mobile/.env` at build time. Set the API URL before you build.

## Prerequisites (macOS)

- Node 22+
- Java 17 (this machine uses Zulu 17)
- Android SDK at `~/Library/Android/sdk`
- From the repo: `cd mobile && npm install`

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

## 1. Point the app at a reachable API

Edit `mobile/.env`:

```bash
# Physical device on the same Wi-Fi as your Mac:
# EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3001/api/v1

# Deployed backend:
EXPO_PUBLIC_API_URL=http://<HOST>/mobile/api/v1
```

A phone cannot use `localhost` or `10.0.2.2`. Those only work on the simulator / emulator.

The current server is **HTTP** (`http://...`), not HTTPS. Android 9+ blocks HTTP in **release** APKs by default. Debug / `adb` installs still work because Expo only puts `usesCleartextTraffic` on the debug manifest.

`app.json` has `android.usesCleartextTraffic: true`, but Expo 56 does not copy that onto the release manifest. The `./plugins/withCleartextTraffic` config plugin writes it onto the main application (plus a network-security-config). Re-run prebuild after changing that plugin, then assembleRelease. Without it, the phone shows a connection error even though it has internet.

Also set Google client IDs in `.env` if you need Sign in with Google on the APK.

## 2. Generate the native Android project

From `mobile/`:

```bash
npx expo prebuild --platform android
```

This creates `mobile/android/` (gitignored). Re-run with `--clean` if plugins, package name, or native config changed:

```bash
npx expo prebuild --platform android --clean
```

## 3. Assemble the release APK

```bash
export SENTRY_DISABLE_AUTO_UPLOAD=true
cd android
./gradlew assembleRelease
```

First build can take 10–20 minutes. Later builds are faster.

Output:

- `mobile/android/app/build/outputs/apk/release/app-release.apk`

Copy it somewhere easy to find:

```bash
mkdir -p ../dist
cp app/build/outputs/apk/release/app-release.apk ../dist/BudgetBrain-1.0.0.apk
```

This local release APK is signed with the Android **debug** keystore. That is enough for sideload testing, not Play Store upload.

## 4. Install on the phone

### USB (`adb`)

1. On the phone: enable **Developer options** → **USB debugging**.
2. Plug in the phone and accept the RSA prompt.
3. Install:

```bash
adb devices
adb install -r /Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/dist/BudgetBrain-1.0.0.apk
```

### Sideload (no cable)

AirDrop or copy `BudgetBrain-1.0.0.apk` to the phone, open it, and allow install from that source if Android asks.

## Rebuild after JS / env changes

If you only changed JS/TS or `.env` and `android/` already exists:

```bash
cd mobile/android
./gradlew assembleRelease
```

If native deps, `app.json` plugins, or package name changed, prebuild again (step 2) then assemble.

## Optional: EAS cloud APK

`eas.json` `preview` produces a release APK. EAS does **not** read `mobile/.env` (gitignored) and does **not** use your local `android/` folder. It prebuilds from `app.json` + plugins, and bakes `EXPO_PUBLIC_*` from `eas.json` `build.base.env`.

The mobile app only reads these runtime keys. `build.base.env` already has every one that has a value:

| Key | Needed for |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Login and every API call |
| `EXPO_PUBLIC_WEB_URL` | Subscriptions paywall (opens the web app) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google Sign-In — must be the **Web** client ID the backend verifies |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Same Web client (native `webClientId`) |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Android OAuth client (package + SHA-1 in Cloud Console) |
| `EXPO_PUBLIC_PACK_PUBLIC_KEYS` | Knowledge-pack updates for SMS detection: `{"<key id>":"<base64 public key>"}` for the server's `PACK_KEY_ID` (backend `DEPLOY.md` §6a). Without it the app keeps its built-in India pack and downloads nothing |

Leave these out until you actually have values — empty keys disable the feature, they do not break the app:

- `EXPO_PUBLIC_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_HOST` — analytics
- `EXPO_PUBLIC_SENTRY_DSN` — crash reporting
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — iOS only
- `EXPO_PUBLIC_GOOGLE_CLIENT_SECRET` — Expo Go browser OAuth only; never put this in EAS

`SENTRY_DISABLE_AUTO_UPLOAD=true` is build-time only so EAS does not fail without a Sentry auth token.

Commit `plugins/withCleartextTraffic.js`, the plugin entry in `app.json`, and `eas.json` before you build. Without the plugin, Android blocks HTTP and login shows "Unable to reach the BudgetBrain server". Without the env block, the APK falls back to `http://localhost:8000/api/v1`.

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Download the APK from the Expo dashboard when the build finishes.

Google Sign-In on an EAS APK uses Expo's keystore, not the local debug keystore. After the first build, run `eas credentials -p android` and paste that SHA-1 into the Android OAuth client (package `app.budgetbrain.mobile`).

## SMS auto-tracking and the `noSms` variant

Bank-SMS detection is a local Expo module, `modules/sms-detector` (Kotlin). `./plugins/withSmsDetector` adds the SMS receiver and the `RECEIVE_SMS` / `READ_SMS` permissions to the manifest. Expo Go has no native module, so detection stays off there. Use a dev client or a release build to try it.

If Google Play rejects the SMS permission declaration (see `docs/SMS_PERMISSION_DECLARATION.md`), ship the variant without SMS. It declares no SMS permission, and the app falls back to manual entry:

```bash
# Local
BUDGETBRAIN_NO_SMS=1 npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease

# EAS
eas build --platform android --profile production-nosms   # or preview-nosms for an APK
```

After prebuild, `android/app/src/main/AndroidManifest.xml` should have no `SmsReceiver`, and both SMS permissions should be marked `tools:node="remove"`.

The detector's pure-Kotlin logic (pre-filter, multipart join, watermark) has JVM tests that run without the Android SDK:

```bash
gradle -p modules/sms-detector/jvm-test test
```

## Troubleshooting

- **Cannot reach the server** — `.env` still has `localhost` or `10.0.2.2`, or the phone is not on a network that can reach the host. Rebuild after fixing `.env`.
- **"Unable to reach the BudgetBrain server"** on a phone that clearly has internet, while `adb` / Expo Go works — the release APK is blocking HTTP. Local: confirm `android/app/src/main/AndroidManifest.xml` has `android:usesCleartextTraffic="true"` on `<application>`. EAS: confirm `./plugins/withCleartextTraffic` is in `app.json` and `eas.json` `build.base.env` has `EXPO_PUBLIC_API_URL`. This goes away once the API is on HTTPS.
- **Install blocked** — allow installs from this source, or uninstall an existing `app.budgetbrain.mobile` build first if signatures differ.
- **`adb` empty** — unlock the phone, replug USB, and check `adb devices`.

## Google Sign-In on the APK

The APK cannot use the Expo Go browser OAuth flow. Google shows **Access blocked** if the app sends an Android client ID to `accounts.google.com`. Standalone Android uses native Google Sign-In instead.

### 1. Google Cloud Console

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Keep the existing **Web** client ID. That value is `EXPO_PUBLIC_GOOGLE_CLIENT_ID` and is what the backend verifies.
3. Open (or create) the **Android** client ID:
   - Package name: `app.budgetbrain.mobile`
   - SHA-1: the fingerprint of the keystore that signed this APK (debug keystore for local `assembleRelease`)
4. If the OAuth consent screen is in **Testing**, add the Google account on the phone as a test user.

Print the local debug SHA-1:

```bash
cd mobile/android
./gradlew signingReport
```

Look for the `Variant: release` / `Config: debug` SHA-1 (this local APK is signed with the debug keystore). Paste that SHA-1 into the Android OAuth client and save. You do not need to rebuild after only changing SHA-1 in Cloud Console.

### 2. Rebuild after code / env changes

Native Google Sign-In is compiled into the APK. After changing JS or adding the library, rebuild (steps 2–3 above) and reinstall.