#!/usr/bin/env bash
# Builds an Android APK via EAS (cloud) using the "preview" profile and downloads
# it to build/social-snout.apk so the e2e runner can install it.
set -euo pipefail

mkdir -p build
echo "[build] Starting EAS preview build (Android APK, cloud)..."
eas build --platform android --profile preview --non-interactive --wait

echo "[build] Fetching URL of the latest finished Android preview build..."
URL=$(eas build:list --platform android --status finished --limit 1 --json --non-interactive \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const b=JSON.parse(d)[0];process.stdout.write(b.artifacts.applicationArchiveUrl||"")})')

if [ -z "$URL" ]; then
  echo "Could not resolve build artifact URL." >&2
  exit 1
fi

echo "[build] Downloading APK -> build/social-snout.apk"
curl -L -o build/social-snout.apk "$URL"
echo "[build] Done."
