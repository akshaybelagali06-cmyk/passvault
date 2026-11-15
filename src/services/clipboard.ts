import * as Clipboard from 'expo-clipboard';

let clearTimer: ReturnType<typeof setTimeout> | null = null;

export async function copyPassword(password: string, clearAfterMs = 30_000): Promise<void> {
  if (clearTimer) clearTimeout(clearTimer);

  await Clipboard.setStringAsync(password, {
    android: { isSensitive: true },
  });

  clearTimer = setTimeout(() => {
    void clearIfUnchanged(password);
  }, clearAfterMs);
}

async function clearIfUnchanged(password: string): Promise<void> {
  try {
    const current = await Clipboard.getStringAsync();
    if (current === password) {
      await Clipboard.setStringAsync('');
    }
  } finally {
    clearTimer = null;
  }
}
