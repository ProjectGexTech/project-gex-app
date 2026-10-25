import { createHash } from 'node:crypto';

// Server-only: picks the API key for a request. A key typed into the app (sent as a
// header) wins; otherwise the server's own key from .env.local is used.

const KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export type ResolvedKey = { key: string } | { error: string } | null;

/** The key to use, an error for a malformed key, or null when there is none at all */
export function resolveApiKey(fromRequest: string | null, fromEnv: string | undefined): ResolvedKey {
  const sent = fromRequest?.trim();
  if (sent) {
    return KEY_PATTERN.test(sent) ? { key: sent } : { error: 'That API key has an unexpected format' };
  }
  const own = fromEnv?.trim();
  return own ? { key: own } : null;
}

/**
 * Short, one-way identifier of a key for cache entries. Each key gets its own entries,
 * so a request can only read data that the same key already paid for.
 */
export function keyFingerprint(key: string): string {
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}
