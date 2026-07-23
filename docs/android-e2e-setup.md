# Android E2E Testing — Setup

Automated Android UI testing run with one command.

**Stack:** EAS Build (cloud APK) → Android emulator (local) → Maestro (YAML UI flows).

For the manual QA smoke test and seed accounts, see [install-checklist.md](install-checklist.md).

---

## One-time setup

### 1. Java ⚠️ MANUAL

sdkmanager, avdmanager, emulator and adb all need a JRE. Run in your terminal:

```bash
brew install --cask temurin
```

Confirm with `java -version`.

### 2. Android SDK components (run after Java exists)

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
yes | sdkmanager --sdk_root="$ANDROID_HOME" \
  "platform-tools" "emulator" "platforms;android-34" \
  "system-images;android-34;google_apis;arm64-v8a"
```

### 3. Create the emulator (AVD)

> ⚠️ **JDK 17+ breaks `avdmanager`** — it fails with `Valid system image paths are: null`
> even though `sdkmanager --list_installed` shows the image. This machine runs JDK 26,
> so the AVD `social_snout_test` was created by writing its config directly to
> `~/.android/avd/` (a Pixel-6 profile on `android-34;google_apis;arm64-v8a`). If you
> need to recreate it, either install a JDK 11/17 just for avdmanager, or copy the
> INI/config.ini approach from git history of this repo. The emulator itself runs fine
> under JDK 26.

### 4. Maestro (already installed at ~/.maestro/bin)

### 5. Persist env vars — add to `~/.zshrc`

```bash
export JAVA_HOME="$(/usr/libexec/java_home)"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$HOME/.maestro/bin"
```

---

## Running the tests

```bash
npm run e2e:build     # cloud-builds the APK via EAS → build/social-snout.apk
npm run e2e:android   # boots emulator, installs APK, runs all .maestro/ flows
```

`e2e:build` is slow (cloud build) and only needed when app code changes.
`e2e:android` re-runs flows against the already-built APK. Results → `maestro-report.xml`.

---

## How an agent uses this

Tell the agent **"run the Android e2e tests"** and it will:

1. `npm run e2e:android` (build first with `e2e:build` if the APK is stale/missing).
2. Read `maestro-report.xml` for pass/fail.
3. On failure, inspect `.maestro/` flows + Maestro output and fix.

New flows: add a `.maestro/NN_name.yaml` file. See [.maestro/README.md](../.maestro/README.md).

---

## Emulator + location notes

- **Keyboard covers buttons.** The soft keyboard hides submit buttons at the bottom
  of a screen. Flows call `hideKeyboard` before tapping Sign In / Send / Create Account.
- **Location on the emulator.** `expo-location` reads the Play-Services _fused_ provider,
  which ignores `adb emu geo fix` on the `google_apis` image (`last location` stays null),
  so live `getCurrentLocation()` hangs. The app avoids this by using each user's _saved_
  location from Supabase — `parseLocation` in [hooks/useUserLocation.ts](../hooks/useUserLocation.ts)
  decodes the PostGIS WKB-hex the API returns, so seed users like `emma.johnson@test.com`
  load their Bellevue, WA location without any GPS. The runner still sets a mock fix and
  flows keep an `enable_location` guard as a fallback for accounts with no saved location.

---

## Setup status

- [x] Android command-line tools installed (brew)
- [x] Maestro installed
- [x] EAS `preview` profile builds Android APK (in `eas.json`)
- [x] `.maestro/` flows, `scripts/`, npm scripts created
- [x] Java installed (Temurin JDK 26)
- [x] SDK system image + platform-tools + platform (android-34) downloaded
- [x] AVD `social_snout_test` created (manually, see JDK note above) — boots to Android 14
- [x] APK built and flows running against it
