import { NextRequest, NextResponse } from 'next/server';
import { cached } from '@/lib/serverCache';
import { resolveApiKey, keyFingerprint } from '@/lib/serverApiKeys';
import { ODDS_KEY_HEADER } from '@/lib/apiKeyHeaderNames';

// Proxies The Odds API with the key typed into the app (sent as a header) or, failing
// that, ODDS_API_KEY from .env.local. The browser never calls the provider directly.

const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const CACHE_TTL_MS = 5 * 60 * 1000; // Odds move; 5 minutes balances freshness and credits
const FORWARDED_PARAMS = ['regions', 'markets', 'bookmakers', 'oddsFormat', 'dateFormat'];

interface UpstreamResult {
  status: number;
  body: unknown;
  remaining: string | null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  if (!/^[a-z0-9_]+$/.test(sport)) {
    return NextResponse.json({ error: 'Unknown sport' }, { status: 400 });
  }

  const resolved = resolveApiKey(request.headers.get(ODDS_KEY_HEADER), process.env.ODDS_API_KEY);
  if (!resolved) {
    return NextResponse.json(
      { error: 'No Odds API key. Enter it with the API keys button, or set ODDS_API_KEY in .env.local.' },
      { status: 401 }
    );
  }
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }
  const apiKey = resolved.key;

  // Only known parameters, in a fixed order, so equal queries share a cache entry
  const query = new URLSearchParams();
  for (const name of FORWARDED_PARAMS) {
    const value = request.nextUrl.searchParams.get(name);
    if (value) query.set(name, value);
  }
  const cacheKey = `odds:${keyFingerprint(apiKey)}:${sport}?${query}`;

  try {
    const result = await cached<UpstreamResult>(
      cacheKey,
      CACHE_TTL_MS,
      async () => {
        const upstream = new URLSearchParams(query);
        upstream.set('apiKey', apiKey);
        const response = await fetch(`${API_BASE_URL}/sports/${sport}/odds?${upstream}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(15_000),
        });
        return {
          status: response.status,
          body: await response.json().catch(() => ({ message: response.statusText })),
          remaining: response.headers.get('x-requests-remaining'),
        };
      },
      result => result.status === 200
    );

    const headers: Record<string, string> = {};
    if (result.remaining) headers['x-requests-remaining'] = result.remaining;
    return NextResponse.json(result.body, { status: result.status, headers });
  } catch {
    return NextResponse.json({ error: 'Could not reach The Odds API' }, { status: 502 });
  }
}
