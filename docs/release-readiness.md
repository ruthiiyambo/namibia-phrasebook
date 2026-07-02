# Release Readiness

This app is aligned with a free-first launch. The best path is to get the first
public version clean, stable, and review-safe, then keep improving it after it
is live instead of waiting for perfection.

## Current app behavior

- The phrasebook now uses bundled workbook content as the `v1` source of truth,
  so the full language and category set ships inside the app.
- Guests can browse the app without creating an account, and sign-in / sign-up
  are removed from the `v1` launch flow.
- The first release is free-first, with no purchase flow or locked-content UX.

## Must fix before submission

### Product and content quality

- [x] Replace the "too few words" experience with the fuller workbook content
      from `namibian_phrasebook_updated.xlsx`.
- [x] Keep the phrasebook structured by category so the app does not open into
      one long flat list of words.
- [ ] Review the imported phrases for obvious duplicates, broken rows, missing
      translations, and category mismatches.
      Use `docs/content-qa.md` as the working audit report.
- [x] Tighten search, browsing, and phrase detail copy so the larger dataset
      feels clearer in the guest-only launch flow.
- [x] Check that the first-run experience explains what the app is and how to
      start browsing phrases.
- [x] Tighten the display so the app feels guided and intentional instead of
      like a spreadsheet export.

### Production data and reliability

- [ ] Test the app with a fresh install so loading, empty, and error states
      feel intentional instead of broken.
- [ ] Confirm guest browsing, language loading, search, and navigation do not
      dead-end.
- [ ] Check icons, splash assets, app name, and color usage for a polished
      first impression.

### Store compliance

- [x] Keep sign-in / sign-up out of the public `v1` build unless account
      management returns in a later release.
- [x] Prepare a privacy policy and support contact that match the app's real
      behavior.
      See `docs/privacy-policy.md`.
- [ ] Complete App Store privacy disclosures and Google Play Data safety /
      deletion answers.
      Draft notes now live in `docs/store-compliance.md`.

### Store listing and review package

- [ ] Prepare App Store Connect and Play Console metadata:
      title, subtitle/short description, full description, keywords/category,
      screenshots, app icon, support URL, privacy policy URL, and review notes.
      Draft copy now lives in `docs/store-listing.md`.
- [x] Write reviewer notes that explain guest browsing and that the launch
      build does not require account creation.
      See `docs/reviewer-notes.md`.
- [ ] Set the age rating / content questionnaire answers in both store consoles.

### Real device QA

- [ ] Build and test on at least one real iPhone and one real Android device.
      Use `docs/device-qa.md` as the working build and QA guide.
- [ ] Verify fresh install, reopen after backgrounding, search, scrolling,
      category browsing, and guest-only flows.
- [ ] Check that the app remains usable on smaller screens.
- [ ] Smoke test release candidates before submission, not just the web build.

## Safe to improve after launch

- [ ] Color tweaks, typography polish, and minor layout refinements.
- [ ] Phrase wording fixes and small copy edits.
- [ ] More categories, more phrases, and improved pronunciation notes.
- [ ] Better onboarding, favorites, recents, or learning flows.
- [ ] RevenueCat and a Pro tier once the free version is stable.
- [ ] Analytics, experiments, and growth features.

## How updates work after launch

- Small non-native changes can be shipped later without waiting for a full
  redesign cycle:
  phrase text, labels, colors, layout tweaks, and bundled images are good
  candidates for over-the-air updates once `expo-updates` is configured and
  included in a shipped build.
- Native changes still require a new binary and store review:
  new native libraries, new permissions, RevenueCat, Expo SDK upgrades, and
  anything else that changes the native app runtime.
- Store listing edits such as screenshots or description changes are managed in
  App Store Connect and Play Console, separate from app code releases.

## Recommended submission strategy

1. Finish the phrase import and category-first browsing experience.
2. Keep the launch flow guest-first so the app remains simple to review and
   simple to understand.
3. Tighten the display so the app feels polished on first open.
4. Prepare store assets, privacy policy, and compliance answers.
5. Run real-device QA on iOS and Android preview builds.
6. Submit the free app once the above items are clean.

## RevenueCat next phase

- Add RevenueCat only after the free launch is stable.
- Keep the first paid model simple:
  one Pro entitlement, one or two products, one paywall, and one restore
  purchases flow.
