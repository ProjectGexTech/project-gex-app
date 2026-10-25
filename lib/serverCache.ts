// Server-side response cache shared by every visitor, so paid API credits are spent once
// per query instead of once per browser. Identical requests that arrive while one is
// already in flight wait for that one instead of calling the API again.
//
// It lives in this server process's memory: it resets on restart, and each instance of a
// multi-instance deployment has its own (swap in Redis or similar if that matters).

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const MAX_ENTRIES = 500;
const entries = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Return the cached value for `key`, or run `load` once and cache its result for `ttlMs`.
 * `shouldCache` decides per result (e.g. don't cache upstream errors).
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  shouldCache: (value: T) => boolean = () => true
): Promise<T> {
  const hit = entries.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = load()
    .then(value => {
      if (shouldCache(value)) {
        // Map keeps insertion order: drop the oldest entry when full
        if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value!);
        entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      }
      return value;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}
