export const ENTRY_CATEGORIES = ['Social', 'Email', 'Banking', 'Work'] as const;

export type EntryCategory = (typeof ENTRY_CATEGORIES)[number];

export interface ServiceDefinition {
  name: string;
  domain: string;
  brandColor: string;
  defaultCategory: EntryCategory;
  androidPackage?: string;
}

export interface VaultEntry {
  id: string;
  serviceName: string;
  username: string;
  password: string;
  website: string;
  category: EntryCategory;
  brandColor: string;
  androidPackage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultEntryDraft {
  serviceName: string;
  username: string;
  password: string;
  website: string;
  category: EntryCategory;
  brandColor: string;
  androidPackage?: string;
}
