/**
 * PIN service — hashing, verification, secure storage, and rate-limiting.
 *
 * The PIN is never logged, stored, or used as an encryption key. Only the
 * Argon2id record and lockout state are persisted in Secure Store.
 */
import * as ExpoCrypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { argon2idAsync } from '@noble/hashes/argon2.js';

export const SECURE_STORE_KEYS = {
  PIN_RECORD: 'pv.pin.record',
  LOCKOUT: 'pv.pin.lockout',
} as const;

const RECORD_VERSION = 1;
const KDF_PARAMS_V2 = { t: 1, m: 4096, p: 1, dkLen: 32 } as const;

interface KdfParams {
  t: number;
  m: number;
  p: number;
  dkLen: number;
}

interface PinRecord {
  version: number;
  hashHex: string;
  saltHex: string;
  params: KdfParams;
}

interface LockoutState {
  count: number;
  unlockAt?: number;
}

export class PinRecordError extends Error {
  constructor(message: string) {
    super(`PassVault: malformed PIN record${message ? ` — ${message}` : ''}`);
    this.name = 'PinRecordError';
  }
}

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  ExpoCrypto.getRandomValues(buf);
  return buf;
}

function uint8ToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8(hex: string): Uint8Array {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new PinRecordError('hex fields are invalid');
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

function isAllZero(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}

function validateParams(value: unknown): KdfParams {
  if (!value || typeof value !== 'object') {
    throw new PinRecordError('KDF parameters are missing');
  }

  const params = value as Record<string, unknown>;
  const isInteger = (item: unknown): item is number =>
    typeof item === 'number' && Number.isInteger(item) && Number.isFinite(item);

  if (
    !isInteger(params.t) || params.t < 1 || params.t > 10 ||
    !isInteger(params.m) || params.m < 4096 || params.m > 262144 ||
    !isInteger(params.p) || params.p < 1 || params.p > 4 ||
    !isInteger(params.dkLen) || params.dkLen !== 32
  ) {
    throw new PinRecordError('KDF parameters are outside safe limits');
  }

  return {
    t: params.t,
    m: params.m,
    p: params.p,
    dkLen: params.dkLen,
  };
}

function parseRecord(serialized: string): PinRecord {
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new PinRecordError('JSON is invalid');
  }

  if (!value || typeof value !== 'object') {
    throw new PinRecordError('record is not an object');
  }

  const record = value as Record<string, unknown>;
  if (record.version !== RECORD_VERSION ||
      typeof record.hashHex !== 'string' ||
      typeof record.saltHex !== 'string') {
    throw new PinRecordError('record fields are invalid');
  }

  const hash = hexToUint8(record.hashHex);
  const salt = hexToUint8(record.saltHex);
  if (hash.length !== 32) {
    throw new PinRecordError('hash must be 32 bytes');
  }
  if (salt.length < 16 || salt.length > 64) {
    throw new PinRecordError('salt length is invalid');
  }

  return {
    version: RECORD_VERSION,
    hashHex: record.hashHex,
    saltHex: record.saltHex,
    params: validateParams(record.params),
  };
}

async function readRecord(): Promise<PinRecord | null> {
  const serialized = await SecureStore.getItemAsync(SECURE_STORE_KEYS.PIN_RECORD);
  return serialized === null ? null : parseRecord(serialized);
}

async function readLockout(): Promise<LockoutState> {
  const serialized = await SecureStore.getItemAsync(SECURE_STORE_KEYS.LOCKOUT);
  if (serialized === null) return { count: 0 };

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error('PassVault: lockout state is invalid');
  }

  if (!value || typeof value !== 'object') {
    throw new Error('PassVault: lockout state is invalid');
  }

  const state = value as Record<string, unknown>;
  if (
    typeof state.count !== 'number' ||
    !Number.isInteger(state.count) ||
    state.count < 0 ||
    (state.unlockAt !== undefined &&
      (typeof state.unlockAt !== 'number' || !Number.isFinite(state.unlockAt)))
  ) {
    throw new Error('PassVault: lockout state is invalid');
  }

  return { count: state.count, unlockAt: state.unlockAt };
}

async function writeLockout(state: LockoutState): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_KEYS.LOCKOUT, JSON.stringify(state));
}

async function hashPIN(pin: string, salt: Uint8Array, params: KdfParams): Promise<Uint8Array> {
  const startedAt = Date.now();
  const hash = await argon2idAsync(new TextEncoder().encode(pin), salt, params);
  if (__DEV__) {
    console.log(`PassVault: PIN hash took ${Date.now() - startedAt} ms`);
  }
  return hash;
}

function recordFrom(pinHash: Uint8Array, salt: Uint8Array): PinRecord {
  return {
    version: RECORD_VERSION,
    hashHex: uint8ToHex(pinHash),
    saltHex: uint8ToHex(salt),
    params: KDF_PARAMS_V2,
  };
}

async function writePinRecord(pin: string): Promise<void> {
  const salt = randomBytes(16);
  if (__DEV__) {
    const sanitySalt = randomBytes(16);
    if (isAllZero(salt) || isAllZero(sanitySalt) || sameBytes(salt, sanitySalt)) {
      throw new Error('PassVault: random salt sanity check failed');
    }
  }

  const hash = await hashPIN(pin, salt, KDF_PARAMS_V2);
  await SecureStore.setItemAsync(SECURE_STORE_KEYS.PIN_RECORD, JSON.stringify(recordFrom(hash, salt)));
}

export function validatePin(pin: string): string | null {
  if (!/^\d{6}$/.test(pin)) return 'PIN must be exactly 6 digits.';
  if (/^(\d)\1{5}$/.test(pin)) return 'PIN cannot use the same digit six times.';
  const digits = pin.split('').map(Number);
  const step = digits[1] - digits[0];
  if ((step === 1 || step === -1) && digits.every((digit, index) => index === 0 || digit - digits[index - 1] === step)) {
    return 'PIN cannot be a simple sequence.';
  }
  return null;
}

export async function isPinSet(): Promise<boolean> {
  return (await readRecord()) !== null;
}

export async function createPin(pin: string): Promise<void> {
  const validationMessage = validatePin(pin);
  if (validationMessage) throw new Error(validationMessage);
  if (await readRecord()) throw new Error('PassVault: a PIN already exists');

  await writePinRecord(pin);
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.LOCKOUT);
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; locked: false; attemptsUsed: number }
  | { ok: false; locked: true; lockedUntil: number };

export function lockoutMs(failCount: number): number {
  if (failCount < 3) return 0;
  if (failCount < 5) return 10_000;
  if (failCount < 10) return 30_000;
  if (failCount < 15) return 5 * 60_000;
  return 15 * 60_000;
}

let verificationQueue: Promise<void> = Promise.resolve();

async function verifyPinUnlocked(pin: string): Promise<VerifyResult> {
  const record = await readRecord();
  if (!record) throw new Error('PassVault: no PIN stored');

  const lockout = await readLockout();
  if (lockout.unlockAt && Date.now() < lockout.unlockAt) {
    return { ok: false, locked: true, lockedUntil: lockout.unlockAt };
  }

  const attemptsUsed = lockout.count + 1;
  const delay = lockoutMs(attemptsUsed);
  const reservedUnlockAt = delay > 0 ? Date.now() + delay : undefined;
  await writeLockout({ count: attemptsUsed, unlockAt: reservedUnlockAt });

  const candidate = await hashPIN(pin, hexToUint8(record.saltHex), record.params);
  const stored = hexToUint8(record.hashHex);
  let difference = 0;
  for (let index = 0; index < stored.length; index += 1) {
    difference |= stored[index] ^ candidate[index];
  }

  if (difference === 0) {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.LOCKOUT);
    return { ok: true };
  }

  if (reservedUnlockAt) {
    return { ok: false, locked: true, lockedUntil: reservedUnlockAt };
  }
  return { ok: false, locked: false, attemptsUsed };
}

export function verifyPin(pin: string): Promise<VerifyResult> {
  const result = verificationQueue.then(() => verifyPinUnlocked(pin));
  verificationQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function changePin(oldPin: string, newPin: string): Promise<void> {
  const validationMessage = validatePin(newPin);
  if (validationMessage) throw new Error(validationMessage);

  const result = await verifyPin(oldPin);
  if (!result.ok) {
    throw new Error(result.locked ? 'PassVault: PIN verification is locked' : 'PassVault: current PIN is incorrect');
  }

  await writePinRecord(newPin);
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.LOCKOUT);
}

export async function getFailedAttemptState(): Promise<
  | { locked: false; count: number }
  | { locked: true; lockedUntil: number }
> {
  const state = await readLockout();
  if (state.unlockAt && Date.now() < state.unlockAt) {
    return { locked: true, lockedUntil: state.unlockAt };
  }
  return { locked: false, count: state.count };
}
