import { NextRequest, NextResponse } from 'next/server';
import { ML_SERVER } from '@/lib/mlServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${ML_SERVER}/predict`, {
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

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'ML server offline. Run python_model/start.bat to enable predictions.' },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${ML_SERVER}/health`, {
      signal: AbortSignal.timeout(3_000),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'offline', models_ready: false }, { status: 503 });
  }
}
