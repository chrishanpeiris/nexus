// ─── /api/auth/me — Route Handler ────────────────────────────────────────────
// Returns the current session user from the JWT cookie.
// Used by client components that need the user without a full page render.

import { NextResponse } from 'next/server';
import { getSession }   from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: session });
}
