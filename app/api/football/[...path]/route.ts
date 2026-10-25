import { NextRequest, NextResponse } from 'next/server';
import { cached } from '@/lib/serverCache';

// Proxies API-Football so the key stays on the server (API_FOOTBALL_KEY in .env.local)
// and every visitor shares cached responses. Only the endpoints the app uses are allowed.

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

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    // Same shape as API-Football's own errors, so the client reports it the same way
    return NextResponse.json(
      { errors: { token: 'key is not set on the server. Add API_FOOTBALL_KEY to .env.local and restart' } },
      { status: 200 }
    );
  }

  const query = new URLSearchParams([...request.nextUrl.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
  const cacheKey = `football:${endpoint}?${query}`;

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
