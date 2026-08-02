#!/bin/bash
set -e

echo "=== Building web assets ==="
npm run build

echo "=== Syncing Capacitor ==="
npx cap sync android

echo "=== Building debug APK ==="
cd android
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "=== APK built successfully ==="
  echo "Location: android/$APK_PATH"
  echo ""
  echo "Copy it to your phone:"
  echo "  cp android/$APK_PATH ~/Desktop/ArmLog.apk"
else
  echo "Build failed — check the output above."
  exit 1
fi
