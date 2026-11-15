import { lockoutMs, SECURE_STORE_KEYS, validatePin } from '@/services/pin';

test('all SecureStore keys use the supported format', () => {
  for (const key of Object.values(SECURE_STORE_KEYS)) {
    expect(key).toMatch(/^[\w.-]+$/);
  }
});

describe('validatePin', () => {
  test('accepts a six-digit PIN that is not predictable', () => {
    expect(validatePin('284619')).toBeNull();
  });

  test('rejects invalid length and non-digit input', () => {
    expect(validatePin('12345')).toBe('PIN must be exactly 6 digits.');
    expect(validatePin('12345a')).toBe('PIN must be exactly 6 digits.');
  });

  test('rejects repeated digits and simple sequences', () => {
    expect(validatePin('111111')).toBe('PIN cannot use the same digit six times.');
    expect(validatePin('123456')).toBe('PIN cannot be a simple sequence.');
    expect(validatePin('654321')).toBe('PIN cannot be a simple sequence.');
    expect(validatePin('234567')).toBe('PIN cannot be a simple sequence.');
    expect(validatePin('765432')).toBe('PIN cannot be a simple sequence.');
  });
});

describe('lockoutMs', () => {
  test.each([
    [0, 0],
    [2, 0],
    [3, 10_000],
    [4, 10_000],
    [5, 30_000],
    [9, 30_000],
    [10, 5 * 60_000],
    [14, 5 * 60_000],
    [15, 15 * 60_000],
  ])('returns the expected delay for %i attempts', (attempts, expected) => {
    expect(lockoutMs(attempts)).toBe(expected);
  });
});
