/**
 * PIN service — hashing, verification, secure storage, rate-limiting.
 *
 * Security model:
 *  - The PIN is NEVER logged, stored, or used as an encryption key.
 *  - Only the Argon2id hash + random salt + KDF params are persisted in
 *    expo-secure-store.
 *  - Failed-attempt counts and lockout timestamps are also kept in
 *    expo-secure-store so they survive app restarts.
 *  - expo-crypto is imported here to trigger its global `crypto.getRandomValues`
 *    polyfill before @noble/hashes runs.
 */

// Must be first: triggers the global crypto.getRandomValues polyfill
import * as ExpoCrypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { argon2id } from '@noble/hashes/argon2.js';

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  PIN_HASH:    'pv:pin:hash',
  SALT:        'pv:pin:salt',
  PARAMS:      'pv:pin:params',
  FAIL_COUNT:  'pv:pin:failCount',
  FAIL_UNLOCK: 'pv:pin:failUnlockAt',
} as const;

// ─── KDF parameters ──────────────────────────────────────────────────────────
// t=3 iterations, m=65536 KiB (64 MiB), p=1 lane, 32-byte output.
// Targets ~300–500 ms on a mid-range Android device.
const KDF_PARAMS = { t: 3, m: 65536, p: 1, dkLen: 32 } as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate n cryptographically-secure random bytes. */
function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  // expo-crypto polyfills this globally; @noble/hashes uses it internally too.
  ExpoCrypto.getRandomValues(buf);
  return buf;
}

/** Yield one event-loop turn so React can render a spinner before blocking. */
function yieldToUI(): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * Hash `pin` with Argon2id.
 * Yields to UI first so a loading spinner can appear.
 */
async function hashPIN(pin: string, salt: Uint8Array): Promise<Uint8Array> {
  await yieldToUI();
  return argon2id(new TextEncoder().encode(pin), salt, KDF_PARAMS);
}

function uint8ToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8(h: string): Uint8Array {
  const a = new Uint8Array(h.length / 2);
  for (let i = 0; i < a.length; i++) {
    a[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return a;
}

// ─── Lockout schedule ────────────────────────────────────────────────────────
/**
 * Returns the number of milliseconds the user must wait after `failCount`
 * consecutive wrong PINs.
 *   < 3  wrong → no delay
 *   3-4  wrong → 10 s
 *   5-9  wrong → 30 s
 *  10-14 wrong → 5 min
 *  15+   wrong → 15 min
 */
function lockoutMs(failCount: number): number {
  if (failCount < 3)  return 0;
  if (failCount < 5)  return 10_000;
  if (failCount < 10) return 30_000;
  if (failCount < 15) return 5 * 60_000;
  return 15 * 60_000;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Returns true if a PIN has been created and stored. */
export async function isPinSet(): Promise<boolean> {
  const h = await SecureStore.getItemAsync(KEYS.PIN_HASH);
  return h !== null;
}

/**
 * Hash the PIN with a fresh random salt and persist hash + salt + params.
 * Also clears any existing failed-attempt state.
 */
export async function createPin(pin: string): Promise<void> {
  const salt = randomBytes(16);
  const hash = await hashPIN(pin, salt);

  await SecureStore.setItemAsync(KEYS.SALT,     uint8ToHex(salt));
  await SecureStore.setItemAsync(KEYS.PIN_HASH, uint8ToHex(hash));
  await SecureStore.setItemAsync(KEYS.PARAMS,   JSON.stringify(KDF_PARAMS));

  // Clear any leftover lockout state
  await SecureStore.deleteItemAsync(KEYS.FAIL_COUNT);
  await SecureStore.deleteItemAsync(KEYS.FAIL_UNLOCK);
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; locked: false; attemptsUsed: number }
  | { ok: false; locked: true; lockedUntil: number };

/**
 * Verify a PIN entry.
 *  - Checks lockout first (returns locked result without hashing if still locked).
 *  - Uses constant-time comparison to avoid timing attacks.
 *  - Increments fail count and sets lockout timestamp on wrong PIN.
 *  - Clears fail state on correct PIN.
 */
export async function verifyPin(pin: string): Promise<VerifyResult> {
  // 1. Check active lockout
  const unlockAtStr = await SecureStore.getItemAsync(KEYS.FAIL_UNLOCK);
  if (unlockAtStr) {
    const unlockAt = parseInt(unlockAtStr, 10);
    if (Date.now() < unlockAt) {
      return { ok: false, locked: true, lockedUntil: unlockAt };
    }
  }

  // 2. Load stored hash + salt
  const [saltHex, hashHex] = await Promise.all([
    SecureStore.getItemAsync(KEYS.SALT),
    SecureStore.getItemAsync(KEYS.PIN_HASH),
  ]);
  if (!saltHex || !hashHex) {
    throw new Error('PassVault: no PIN stored');
  }

  // 3. Hash the candidate PIN
  const candidate = await hashPIN(pin, hexToUint8(saltHex));
  const stored    = hexToUint8(hashHex);

  // 4. Constant-time comparison (XOR all bytes, then check sum)
  let diff = 0;
  for (let i = 0; i < stored.length; i++) {
    diff |= stored[i] ^ candidate[i];
  }

  if (diff === 0) {
    // Correct — clear fail state
    await SecureStore.deleteItemAsync(KEYS.FAIL_COUNT);
    await SecureStore.deleteItemAsync(KEYS.FAIL_UNLOCK);
    return { ok: true };
  }

  // 5. Wrong — increment fail count
  const countStr = await SecureStore.getItemAsync(KEYS.FAIL_COUNT);
  const count = countStr ? parseInt(countStr, 10) + 1 : 1;
  await SecureStore.setItemAsync(KEYS.FAIL_COUNT, String(count));

  const delay = lockoutMs(count);
  if (delay > 0) {
    const unlockAt = Date.now() + delay;
    await SecureStore.setItemAsync(KEYS.FAIL_UNLOCK, String(unlockAt));
    return { ok: false, locked: true, lockedUntil: unlockAt };
  }

  return { ok: false, locked: false, attemptsUsed: count };
}

/**
 * Returns the current failed-attempt state.
 * Used by the lock screen to decide whether to show a countdown on mount.
 */
export async function getFailedAttemptState(): Promise<
  | { locked: false; count: number }
  | { locked: true; lockedUntil: number }
> {
  const [countStr, unlockAtStr] = await Promise.all([
    SecureStore.getItemAsync(KEYS.FAIL_COUNT),
    SecureStore.getItemAsync(KEYS.FAIL_UNLOCK),
  ]);

  if (unlockAtStr) {
    const unlockAt = parseInt(unlockAtStr, 10);
    if (Date.now() < unlockAt) {
      return { locked: true, lockedUntil: unlockAt };
    }
  }

  return { locked: false, count: countStr ? parseInt(countStr, 10) : 0 };
}
