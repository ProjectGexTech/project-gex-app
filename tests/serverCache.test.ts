import { describe, expect, it, vi } from 'vitest';
import { cached } from '@/lib/serverCache';

describe('cached', () => {
  it('calls the loader once and serves later requests from the cache', async () => {
    const load = vi.fn(async () => 'odds');
    expect(await cached('a', 60_000, load)).toBe('odds');
    expect(await cached('a', 60_000, load)).toBe('odds');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('merges requests that arrive while the first is still loading', async () => {
    let finish!: (v: string) => void;
    const load = vi.fn(() => new Promise<string>(resolve => { finish = resolve; }));
    const first = cached('b', 60_000, load);
    const second = cached('b', 60_000, load);
    finish('shared');
    expect(await Promise.all([first, second])).toEqual(['shared', 'shared']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not cache results that shouldCache rejects, such as API errors', async () => {
    const load = vi.fn(async () => ({ status: 429 }));
    await cached('c', 60_000, load, r => r.status === 200);
    await cached('c', 60_000, load, r => r.status === 200);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads again after the entry expires', async () => {
    vi.useFakeTimers();
    try {
      const load = vi.fn(async () => 'fresh');
      await cached('d', 1_000, load);
      vi.advanceTimersByTime(1_001);
      await cached('d', 1_000, load);
      expect(load).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not cache a loader that throws', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce('recovered');
    await expect(cached('e', 60_000, load)).rejects.toThrow('network down');
    expect(await cached('e', 60_000, load)).toBe('recovered');
  });
});
