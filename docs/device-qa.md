# Device QA

This repo is now set up for two kinds of installable builds:

- `development`: development client builds for active app work
- `preview`: internal distribution builds for real-device QA

## Current status

- `expo-dev-client` is installed, so the checked-in `development` profile now matches the repo.
- `eas.json` already contains:
  - `development` with `developmentClient: true`
  - `preview` with `distribution: "internal"`
  - Android preview configured as an installable APK
- EAS is reachable from this machine and the Expo account is logged in.
- Latest Android preview QA build is finished and installable:
  `https://expo.dev/artifacts/eas/VpJP3Ti-fseh71siMr-sN11QCl7iCq-utNKYI_5nalI.apk`
- iOS preview is currently blocked because EAS cannot see an Apple team yet.

## Android install now

Use the latest preview APK link above on an Android device, install it, then walk through:

1. Fresh install and first open
2. Language switching across all included languages
3. Home-screen category browsing
4. Search with quick chips and free text
5. About, support, and privacy screens
6. Reopen after backgrounding

## Return Here Next

If we pause this setup, the next thing to resume is:

```bash
eas credentials -p ios
```

Then choose `preview`, log into the Apple Developer account, complete 2FA, and continue with:

```bash
eas device:create
eas build --platform ios --profile preview
```

## Build commands

### Android preview build

```bash
eas build --platform android --profile preview
```

Use this to generate a real installable Android preview APK for device QA.

### iOS preview build

```bash
eas build --platform ios --profile preview
```

This creates an internal distribution iPhone build, but it requires:

1. A paid Apple Developer account
2. An Apple team visible to EAS
3. At least one registered test device UDID

### Android development build

```bash
eas build --platform android --profile development
```

Use this when you want a dev client build for active iteration instead of a QA preview.

### iOS simulator development build

```bash
eas build --platform ios --profile development
```

This current profile is set up for the iOS Simulator, not a physical iPhone.

## iPhone blocker to clear

The current `eas device:list` result shows:

```text
No Apple teams found for account ruthiiyamb.
```

That means the next iPhone steps are:

1. Sign into the correct Apple Developer account in EAS
2. Make sure the Apple team is available to the Expo account
3. Register the test phone:

```bash
eas device:create
```

4. After the phone is registered, build the iPhone preview:

```bash
eas build --platform ios --profile preview
```

## Apple Developer to EAS connection

Use this exact flow in the repo root:

```bash
eas credentials -p ios
```

Then:

1. Choose the `preview` build profile.
2. Answer `Y` when EAS asks whether to log in to your Apple account.
3. Sign in with the Apple ID that belongs to your Apple Developer membership or team.
4. Complete any two-factor authentication prompts.
5. If Apple shows more than one team, choose the team that owns this app.

If the Apple account belongs to an organization, Expo's docs say the safest roles are:

- `Account Holder`
- `Admin`
- `App Manager` with access to Certificates, Identifiers, and Profiles

If this succeeds, EAS should be able to generate and validate the iOS signing credentials needed for preview builds.

After the Apple team is visible, register the iPhone:

```bash
eas device:create
```

Then create the installable iPhone preview build:

```bash
eas build --platform ios --profile preview
```

If you later run iPhone preview builds non-interactively, refresh the ad hoc profile so newly added devices are included:

```bash
eas build --platform ios --profile preview --non-interactive --refresh-ad-hoc-provisioning-profile
```

## Suggested real-device QA checklist

### Install and launch

- Fresh install works
- App icon and splash look correct
- App opens without sign-in
- Reopening after backgrounding works

### Browse flow

- Language switcher works for all languages
- Guided situation cards open the expected category
- Category chips and category cards stay in sync
- Long lists scroll smoothly on smaller screens

### Search flow

- Quick search chips work
- Common searches return useful results
- Empty state is understandable
- Search feels fast with the full workbook dataset

### Content quality

- No obvious duplicate cards in the same category
- Notes read like learner-facing help, not editor notes
- Category placement feels intuitive
- Pronunciation lines are readable

## Supporting docs

- Content QA report: `docs/content-qa.md`
- Launch checklist: `docs/release-readiness.md`
