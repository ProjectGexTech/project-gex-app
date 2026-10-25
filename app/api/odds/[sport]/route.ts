import { NextRequest, NextResponse } from 'next/server';
import { cached } from '@/lib/serverCache';

// Proxies The Odds API so the key stays on the server (ODDS_API_KEY in .env.local)
// and every visitor shares one cached response per query.

const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const CACHE_TTL_MS = 5 * 60 * 1000; // Odds move; 5 minutes balances freshness and credits
const FORWARDED_PARAMS = ['regions', 'markets', 'bookmakers', 'oddsFormat', 'dateFormat'];

interface UpstreamResult {
  status: number;
  body: unknown;
  remaining: string | null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ sport: string }> }) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'The Odds API key is not set on the server. Add ODDS_API_KEY to .env.local and restart.' },
      { status: 503 }
    );
  }

  const { sport } = await params;
  if (!/^[a-z0-9_]+$/.test(sport)) {
    return NextResponse.json({ error: 'Unknown sport' }, { status: 400 });
  }

  // Only known parameters, in a fixed order, so equal queries share a cache entry
  const query = new URLSearchParams();
  for (const name of FORWARDED_PARAMS) {
    const value = request.nextUrl.searchParams.get(name);
    if (value) query.set(name, value);
  }
  const cacheKey = `odds:${sport}?${query}`;

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
