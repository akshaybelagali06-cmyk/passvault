import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  getRandomBytes,
} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const VAULT_KEY = 'pv.vault.key';
const AES_VERSION = 1;
const NONCE_BYTES = 12;

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    result += BASE64_CHARS[first >> 2];
    result += BASE64_CHARS[((first & 3) << 4) | ((second ?? 0) >> 4)];
    result += second === undefined ? '=' : BASE64_CHARS[((second & 15) << 2) | ((third ?? 0) >> 6)];
    result += third === undefined ? '=' : BASE64_CHARS[third & 63];
  }
  return result;
}

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replace(/=+$/, '');
  const bytes = new Uint8Array(Math.floor((normalized.length * 3) / 4));
  let byteIndex = 0;

  for (let index = 0; index < normalized.length; index += 4) {
    const first = BASE64_CHARS.indexOf(normalized[index]);
    const second = BASE64_CHARS.indexOf(normalized[index + 1]);
    const third = BASE64_CHARS.indexOf(normalized[index + 2]);
    const fourth = BASE64_CHARS.indexOf(normalized[index + 3]);
    bytes[byteIndex++] = (first << 2) | (second >> 4);
    if (index + 2 < normalized.length) bytes[byteIndex++] = ((second & 15) << 4) | (third >> 2);
    if (index + 3 < normalized.length) bytes[byteIndex++] = ((third & 3) << 6) | fourth;
  }

  return bytes;
}

async function getVaultKey(): Promise<AESEncryptionKey> {
  const encoded = await SecureStore.getItemAsync(VAULT_KEY);
  if (encoded) return AESEncryptionKey.import(encoded, 'hex');

  const key = await AESEncryptionKey.generate(256);
  await SecureStore.setItemAsync(VAULT_KEY, await key.encoded('hex'));
  return key;
}

export interface EncryptedPayload {
  encryptedPayload: string;
  nonce: string;
  encryptionVersion: number;
}

export async function encryptPayload(entryId: string, payload: object): Promise<EncryptedPayload> {
  const key = await getVaultKey();
  const nonce = getRandomBytes(NONCE_BYTES);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const associatedData = new TextEncoder().encode(entryId);
  const sealed = await aesEncryptAsync(plaintext, key, {
    nonce: { bytes: nonce },
    additionalData: associatedData,
  });
  const ciphertextWithTag = await sealed.ciphertext({ encoding: 'bytes', includeTag: true });

  if (typeof ciphertextWithTag === 'string') {
    throw new Error('PassVault: encrypted payload returned an invalid format');
  }

  return {
    encryptedPayload: bytesToBase64(ciphertextWithTag),
    nonce: bytesToBase64(nonce),
    encryptionVersion: AES_VERSION,
  };
}

export async function decryptPayload<T>(entryId: string, record: EncryptedPayload): Promise<T> {
  if (record.encryptionVersion !== AES_VERSION) {
    throw new Error('PassVault: unsupported encryption version');
  }

  const key = await getVaultKey();
  const sealed = AESSealedData.fromParts(
    base64ToBytes(record.nonce),
    base64ToBytes(record.encryptedPayload),
    16,
  );
  const associatedData = new TextEncoder().encode(entryId);
  const plaintext = await aesDecryptAsync(sealed, key, {
    output: 'bytes',
    additionalData: associatedData,
  });

  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

