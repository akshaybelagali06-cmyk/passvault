# PassVault: project context

## What it is

Offline-first Android password manager (Expo + React Native + TypeScript + Expo Router). Later: Node/Express + Prisma + PostgreSQL backend for encrypted cloud sync. Dark-first modern UI.

## Security decisions (do not change without asking me)

- No custom crypto. AES-256-GCM with a fresh random nonce per encryption, versioned format, tampered ciphertext must be rejected.
- Vault key = random 256-bit key. The PIN is never the encryption key; it only gates app access.
- Secrets live only in expo-secure-store. Never store plaintext secrets in SQLite or AsyncStorage. Never log passwords, PINs or keys.
- Cloud (later): server only ever sees ciphertext and wrapped keys. Account password -> Argon2id master key wraps the vault key; the server login secret is derived separately; a one-time recovery key wraps a second copy.
- Sync (later): server-assigned sequence cursor, tombstones for deletes, conflict copies instead of silent overwrites.

## Code layout

Routes in src/app/. Crypto and PIN logic in src/services/. Database code in src/database/. Shared UI in src/components/. Theme in src/constants/theme.ts. No crypto inside screen files.

## Milestones

- M1 PIN setup + lock screen + theme: built (pin.ts uses Argon2id from @noble/hashes), device testing in progress.
- M2 local encrypted vault (SQLite, add/edit/delete/search, copy with clipboard clearing): next.
- M3 backend + auth. M4 key envelopes + recovery + sync. M5 devices, hardening, tests, release APK via EAS Build.
