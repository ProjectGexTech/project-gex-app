import { NextResponse } from 'next/server';

// Which keys the server already has from .env.local (never the keys themselves),
// so the app only asks for the ones it needs
export async function GET() {
  return NextResponse.json({
    odds: Boolean(process.env.ODDS_API_KEY?.trim()),
    football: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
  });
}
