This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## PassVault project rules
- App: PassVault, an offline-first Android password manager. Dark-first modern UI. Routes live in src/app/ (per the rules above); everything else lives in src/.
- Security: no custom crypto. Use @noble/ciphers (AES-256-GCM, fresh random nonce for every encryption) and @noble/hashes (Argon2id or scrypt, HKDF). This is an approved exception to "prefer Expo modules", but first check the current expo-crypto docs. If it natively supports AES-256-GCM and a suitable KDF, tell me before choosing. Use async KDF variants so the UI never freezes.
- Never log passwords, PINs or keys. Never store plaintext secrets in SQLite or AsyncStorage. Secrets go in expo-secure-store only.
- The PIN is never used as the encryption key. The vault key is a random 256-bit key. The PIN only gates app access.
- Folders: crypto and PIN logic in src/services/, database code in src/database/, shared UI in src/components/. No crypto inside screen files.
- Fake test data only.
- Work in small steps. Before editing, list the files you will create or change. After changes run `npx tsc --noEmit` and `npx expo lint` and fix problems. Never say something works unless you actually ran it.
- Backend and cloud sync come later (Node + Express + Prisma + PostgreSQL, server only sees ciphertext). Do not build them until I ask.