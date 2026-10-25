import { describe, expect, it } from 'vitest';
import { keyFingerprint, resolveApiKey } from '@/lib/serverApiKeys';

describe('resolveApiKey', () => {
  it('uses the key entered in the app over the server key', () => {
    expect(resolveApiKey('abc123def456', 'server0key000')).toEqual({ key: 'abc123def456' });
  });

  it('falls back to the server key when the app sends none', () => {
    expect(resolveApiKey(null, 'server0key000')).toEqual({ key: 'server0key000' });
    expect(resolveApiKey('   ', 'server0key000')).toEqual({ key: 'server0key000' });
  });

  it('returns null when there is no key anywhere', () => {
    expect(resolveApiKey(null, undefined)).toBeNull();
    expect(resolveApiKey('', '  ')).toBeNull();
  });

  it('rejects keys with unexpected characters instead of forwarding them', () => {
    expect(resolveApiKey('abc 123\r\nx-evil: 1', undefined)).toHaveProperty('error');
    expect(resolveApiKey('short', undefined)).toHaveProperty('error');
  });
});

describe('keyFingerprint', () => {
  it('is stable, distinct per key, and does not contain the key', () => {
    const a = keyFingerprint('abc123def456');
    expect(a).toBe(keyFingerprint('abc123def456'));
    expect(a).not.toBe(keyFingerprint('abc123def457'));
    expect(a).not.toContain('abc123');
    expect(a).toHaveLength(16);
  });
});
