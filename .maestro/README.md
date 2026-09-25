# Maestro end-to-end flows

UI flows for SMS auto-detection, run with [Maestro](https://maestro.mobile.dev) on an Android emulator against a local backend.

| Flow | Checks |
|---|---|
| `01-enable-tracking` | Turning on SMS auto-tracking (permission explainer and system dialog when needed) shows the management section. Detection is on for the account |
| `02-paste-ignored` | A pasted one-time password is rejected as "not a transaction", and Review stays empty |
| `03-paste-review-confirm` | A bank SMS pasted without its sender is recognised from its text (HDFC Bank), waits in Review as "Needs a look", and Confirm adds it |
| `04-paste-review-delete` | Deleting a detected transaction from Review removes it |
| `05-history-undo` | Detected history shows the confirmed item (not the deleted one). Undo takes it back out |

The flows run in this order and depend on each other: 05 expects what 03 and 04 left behind. Every flow starts from a fresh app (`clearState`) and signs in again.

## One-time setup

1. **Backend**, in `budgetbrain-backend`: `npm run db:migrate && npm run db:seed`, then `npm run dev`. The mobile API listens on `http://localhost:3001`. The seed creates the test user `priya@budgetbrain.app` / `Admin123!`, who is verified and onboarded.
2. **Emulator**: an Android 13 or 14 AVD (Google APIs image), started with `emulator -avd <name>`. `adb devices` should list it.
3. **Maestro**: `curl -fsSL https://get.maestro.mobile.dev | bash`, then `maestro --version`.
4. **App build**. Build a release APK that talks to your machine's backend; no Metro is needed while testing. See `BUILD_APK.md` for the Java and Android SDK setup.

   ```bash
   # .env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api/v1   # the emulator's address for your machine

   npx expo prebuild -p android
   cd android && ./gradlew assembleRelease && cd ..
   ```

## Run

```bash
APK=android/app/build/outputs/apk/release/app-release.apk scripts/e2e/run-detection-e2e.sh
```

The script:
1. checks `adb`, Maestro and the backend;
2. installs the APK;
3. checks that detection is on for the test account;
4. deletes that account's detected data, so every run starts clean;
5. runs the flows.

It writes a JUnit report to `.maestro/results/detection-junit.xml`, with screenshots and logs of any failure in `.maestro/results/debug/`.

These variables override the defaults: `API_URL` (as seen from your machine), `E2E_EMAIL` and `E2E_PASSWORD`. To run one flow while you work on it: `maestro test .maestro/detection/02-paste-ignored.yaml`.

## Not covered here

- **A real incoming bank SMS.** The emulator can only send an SMS from a phone number (`adb emu sms send 5551234 …`). The app ignores numeric senders by design, because banks send from headers like `VM-HDFCBK`. Test the live path on a real phone with a real bank alert.
- **The background run with the app closed** (WorkManager and the headless task). This needs a real phone (plan T2.4).
- **iOS.** SMS detection is Android only. The iOS screen offers Paste & Import instead.
