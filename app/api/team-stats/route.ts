import { NextRequest, NextResponse } from 'next/server';
import { ML_SERVER } from '@/lib/mlServer';

// Proxies to the ML server's /team-stats: form and head-to-head from its own match history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${ML_SERVER}/team-stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as Record<string, string>).detail ?? 'ML server error' },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: 'ML server offline. Run python_model/start.bat to load match history.' },
      { status: 503 }
    );
  }
}
