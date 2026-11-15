import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

import { decryptPayload, encryptPayload } from '@/services/encryption';
import type { EntryCategory, VaultEntry, VaultEntryDraft } from '@/types/vault';

interface VaultRow {
  id: string;
  encrypted_payload: string;
  nonce: string;
  encryption_version: number;
  version: number;
  created_at: string;
  updated_at: string;
  android_package: string | null;
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync('passvault.db');
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS vault_entries (
      id TEXT PRIMARY KEY NOT NULL,
      encrypted_payload TEXT NOT NULL,
      nonce TEXT NOT NULL,
      encryption_version INTEGER NOT NULL,
      version INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      android_package TEXT
    );
  `);
  return database;
}

function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= openDatabase();
  return databasePromise;
}

function rowToEncryptedPayload(row: VaultRow) {
  return {
    encryptedPayload: row.encrypted_payload,
    nonce: row.nonce,
    encryptionVersion: row.encryption_version,
  };
}

export async function listEntries(): Promise<VaultEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<VaultRow>(
    'SELECT * FROM vault_entries WHERE deleted_at IS NULL ORDER BY updated_at DESC',
  );
  const entries: VaultEntry[] = [];

  for (const row of rows) {
    const payload = await decryptPayload<Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>>(
      row.id,
      rowToEncryptedPayload(row),
    );
    entries.push({
      ...payload,
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  return entries;
}

export async function getEntry(id: string): Promise<VaultEntry | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<VaultRow>(
    'SELECT * FROM vault_entries WHERE id = ? AND deleted_at IS NULL',
    id,
  );
  if (!row) return null;

  const payload = await decryptPayload<Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>>(
    row.id,
    rowToEncryptedPayload(row),
  );
  return {
    ...payload,
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveEntry(draft: VaultEntryDraft, id?: string): Promise<VaultEntry> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const entryId = id ?? Crypto.randomUUID();
  const existing = id ? await getEntry(id) : null;
  const entry: VaultEntry = {
    ...draft,
    id: entryId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const encrypted = await encryptPayload(entryId, {
    serviceName: entry.serviceName,
    username: entry.username,
    password: entry.password,
    website: entry.website,
    category: entry.category,
    brandColor: entry.brandColor,
    androidPackage: entry.androidPackage,
  });

  await database.runAsync(
    `INSERT INTO vault_entries
      (id, encrypted_payload, nonce, encryption_version, version, created_at, updated_at, deleted_at, android_package)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
      ON CONFLICT(id) DO UPDATE SET
        encrypted_payload = excluded.encrypted_payload,
        nonce = excluded.nonce,
        encryption_version = excluded.encryption_version,
        version = vault_entries.version + 1,
        updated_at = excluded.updated_at,
        deleted_at = NULL,
        android_package = excluded.android_package`,
    entry.id,
    encrypted.encryptedPayload,
    encrypted.nonce,
    encrypted.encryptionVersion,
    1,
    entry.createdAt,
    entry.updatedAt,
    entry.androidPackage ?? null,
  );

  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE vault_entries SET deleted_at = ? WHERE id = ?',
    new Date().toISOString(),
    id,
  );
}

export function isEntryCategory(value: string): value is EntryCategory {
  return ['Social', 'Email', 'Banking', 'Work'].includes(value);
}
