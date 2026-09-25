#!/usr/bin/env bash
# Runs the Maestro detection flows (.maestro/detection) against an Android emulator and a local
# backend. See .maestro/README.md for setup.
#
#   scripts/e2e/run-detection-e2e.sh                 # app already installed
#   APK=path/to/app-release.apk scripts/e2e/run-detection-e2e.sh
#
# Env: API_URL (default http://localhost:3001/api/v1, the backend as seen from this machine),
#      E2E_EMAIL / E2E_PASSWORD (default: the backend seed user), APK (optional, installed first).
set -euo pipefail

cd "$(dirname "$0")/../.."
API_URL="${API_URL:-http://localhost:3001/api/v1}"
E2E_EMAIL="${E2E_EMAIL:-priya@budgetbrain.app}"
E2E_PASSWORD="${E2E_PASSWORD:-Admin123!}"
APP_ID="app.budgetbrain.mobile"
RESULTS=".maestro/results"

fail() { echo "✗ $*" >&2; exit 1; }

command -v maestro >/dev/null || fail "Maestro CLI not found. Install: curl -fsSL https://get.maestro.mobile.dev | bash"
command -v adb >/dev/null || fail "adb not found. Add \$ANDROID_HOME/platform-tools to PATH."
command -v node >/dev/null || fail "node not found."
adb get-state >/dev/null 2>&1 || fail "No Android device or emulator connected (adb devices)."

if [[ -n "${APK:-}" ]]; then
  echo "→ Installing $APK"
  adb install -r "$APK" >/dev/null
fi
adb shell pm path "$APP_ID" >/dev/null 2>&1 || fail "$APP_ID is not installed. Build it (see .maestro/README.md) or pass APK=…"

echo "→ Signing in to $API_URL as $E2E_EMAIL"
LOGIN=$(curl -sS -X POST "$API_URL/auth/login" -H 'content-type: application/json' \
  -d "$(node -e 'console.log(JSON.stringify({email: process.argv[1], password: process.argv[2]}))' "$E2E_EMAIL" "$E2E_PASSWORD")") \
  || fail "Backend not reachable at $API_URL. Start it: cd budgetbrain-backend && npm run dev"
TOKEN=$(node -e 'const r = JSON.parse(process.argv[1]); if (!r.data?.accessToken) process.exit(1); console.log(r.data.accessToken)' "$LOGIN") \
  || fail "Login failed for $E2E_EMAIL. Seed the backend: cd budgetbrain-backend && npm run db:seed"

CONFIG=$(curl -sS "$API_URL/detected-transactions/config" -H "authorization: Bearer $TOKEN")
node -e 'const c = JSON.parse(process.argv[1]).data; if (!c.enabled) { console.error("Detection is off for this account (DETECTION_ENABLED or the staged rollout)."); process.exit(1); }' "$CONFIG" \
  || fail "Turn detection on for the test account before running the flows."

echo "→ Clearing the test account's detected data"
curl -sS -X DELETE "$API_URL/detected-transactions/me" -H "authorization: Bearer $TOKEN" >/dev/null

mkdir -p "$RESULTS"
echo "→ Running Maestro detection flows"
maestro test .maestro \
  --include-tags detection \
  -e E2E_EMAIL="$E2E_EMAIL" -e E2E_PASSWORD="$E2E_PASSWORD" \
  --format junit --output "$RESULTS/detection-junit.xml" \
  --debug-output "$RESULTS/debug"
echo "✓ All detection flows passed. Report: $RESULTS/detection-junit.xml"
