import { NextRequest, NextResponse } from 'next/server';
import { cached } from '@/lib/serverCache';
import { resolveApiKey, keyFingerprint } from '@/lib/serverApiKeys';
import { FOOTBALL_KEY_HEADER } from '@/lib/apiKeyHeaderNames';

// Proxies API-Football with the key typed into the app (sent as a header) or, failing
// that, API_FOOTBALL_KEY from .env.local. Only the endpoints the app uses are allowed.

const API_BASE_URL = 'https://v3.football.api-sports.io';

// endpoint -> cache lifetime
const ALLOWED: Record<string, number> = {
  'teams': 24 * 60 * 60 * 1000,              // team search: IDs don't change
  'teams/statistics': 60 * 60 * 1000,        // changes only after a match
  'fixtures/headtohead': 6 * 60 * 60 * 1000, // past meetings
};

interface UpstreamResult {
  status: number;
  body: any;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpoint = path.join('/');
  const ttl = ALLOWED[endpoint];
  if (ttl === undefined) {
    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 });
  }

  // Errors use API-Football's own shape, so the client reports them the same way
  const resolved = resolveApiKey(request.headers.get(FOOTBALL_KEY_HEADER), process.env.API_FOOTBALL_KEY);
  if (!resolved) {
    return NextResponse.json(
      { errors: { token: 'no key. Enter it with the API keys button, or set API_FOOTBALL_KEY in .env.local' } },
      { status: 200 }
    );
  }
  if ('error' in resolved) {
    return NextResponse.json({ errors: { token: resolved.error } }, { status: 200 });
  }
  const apiKey = resolved.key;

  const query = new URLSearchParams([...request.nextUrl.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
  const cacheKey = `football:${keyFingerprint(apiKey)}:${endpoint}?${query}`;

  try {
    const result = await cached<UpstreamResult>(
      cacheKey,
      ttl,
      async () => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}?${query}`, {
          headers: { 'x-apisports-key': apiKey },
          signal: AbortSignal.timeout(15_000),
        });
        return {
          status: response.status,
          body: await response.json().catch(() => ({ errors: { http: response.statusText } })),
        };
      },
      // API-Football reports errors with HTTP 200 and a non-empty `errors` field
      result => {
        const errors = result.body?.errors;
        const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0;
        return result.status === 200 && !hasErrors;
      }
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'Could not reach API-Football' }, { status: 502 });
  }
}
