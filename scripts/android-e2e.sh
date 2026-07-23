#!/usr/bin/env bash
# Boots the Android emulator, installs the latest APK, and runs Maestro flows.
# Designed to be run with a single command: npm run e2e:android
#
# Prereqs (one-time, see docs/install-checklist.md):
#   - Java (Temurin), Android SDK + emulator, an AVD named $AVD_NAME
#   - Maestro (~/.maestro/bin)
#   - An APK at $APK_PATH (build with: npm run e2e:build)
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home 2>/dev/null)}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$HOME/.maestro/bin:$PATH"

AVD_NAME="${AVD_NAME:-social_snout_test}"
APK_PATH="${APK_PATH:-build/social-snout.apk}"
APP_ID="com.socialsnout.app"
BOOT_TIMEOUT="${BOOT_TIMEOUT:-180}"

log() { printf '\n\033[1;34m[e2e]\033[0m %s\n' "$1"; }

if [ ! -f "$APK_PATH" ]; then
  echo "APK not found at $APK_PATH. Run: npm run e2e:build" >&2
  exit 1
fi

# 1. Boot the emulator if nothing is connected.
if ! adb devices | grep -qw "device"; then
  log "Booting emulator: $AVD_NAME"
  emulator -avd "$AVD_NAME" -no-snapshot -no-audio -no-boot-anim -gpu swiftshader_indirect >/dev/null 2>&1 &
  log "Waiting for device..."
  adb wait-for-device
  # Wait until Android has fully booted.
  end=$((SECONDS + BOOT_TIMEOUT))
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    [ $SECONDS -ge $end ] && { echo "Emulator boot timed out" >&2; exit 1; }
    sleep 2
  done
  adb shell input keyevent 82 || true   # dismiss keyguard
else
  log "Using already-connected device"
fi

# 2. Install (reinstall) the APK. -g grants all runtime permissions (incl. location).
log "Installing APK: $APK_PATH"
adb install -r -g "$APK_PATH"

# 2b. Feed the emulator a mock GPS fix near the seed data (Bellevue, WA) so the
#     Discover/Feed screens find nearby pets instead of an empty deck.
LAT="${MOCK_LAT:-47.6101}"
LON="${MOCK_LON:--122.2015}"
log "Setting mock location: $LAT, $LON"
adb emu geo fix "$LON" "$LAT" >/dev/null 2>&1 || true
adb shell appops set "$APP_ID" android:mock_location allow >/dev/null 2>&1 || true

# 3. Run Maestro flows.
log "Running Maestro flows in .maestro/"
maestro test .maestro/ --format junit --output maestro-report.xml
log "Done. Report: maestro-report.xml"
