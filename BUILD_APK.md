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

The current server is **HTTP** (`http://...`), not HTTPS. A release APK blocks HTTP unless `android.usesCleartextTraffic` is `true` in `app.json` (already set). Without that, the app shows a connection error even though the phone has internet.

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

`eas.json` already has a `preview` profile that produces an APK.

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Download the APK from the Expo dashboard when the build finishes.

## Troubleshooting

- **Cannot reach the server** — `.env` still has `localhost` or `10.0.2.2`, or the phone is not on a network that can reach the host. Rebuild after fixing `.env`.
- **"Unable to connect / check your internet"** on a phone that clearly has internet — the API is `http://` and Android release builds block HTTP unless `android.usesCleartextTraffic` is `true` in `app.json`. That flag is required until the server is on HTTPS.
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