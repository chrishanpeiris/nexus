// ─── Edge Middleware ──────────────────────────────────────────────────────────
// Runs on the EDGE runtime — before the request reaches any route handler,
// Server Component, or page. This is what the article means by
// "running code before the request even hits the server."
//
// Responsibilities:
//   1. Verify JWT from httpOnly cookie (edge-compatible via jose)
//   2. Redirect unauthenticated users away from /dashboard/*
//   3. Redirect authenticated users away from /login and /register
//   4. Forward user identity as request headers for downstream use
//
// What does NOT live here:
//   • Database queries   — Prisma uses Node.js APIs, blocked at the edge
//   • Redis calls        — ioredis uses Node.js APIs, blocked at the edge
//   • Rate limiting      — handled in Route Handlers (Node.js runtime)

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken }               from '@/lib/auth';

// Routes that require authentication
const PROTECTED = ['/dashboard'];
// Routes that authed users shouldn't see
const AUTH_ONLY = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session token from httpOnly cookie
  const token   = request.cookies.get('nexus-session')?.value ?? null;
  const session = token ? await verifyToken(token) : null;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p));

  // ── 1. Unauthenticated → protected route: redirect to login ──────────────
  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // ── 2. Authenticated → auth page: redirect to dashboard ──────────────────
  if (isAuthOnly && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ── 3. Pass user identity to downstream via headers ───────────────────────
  // Server Components read these via headers() without hitting the DB again.
  if (session) {
    const response = NextResponse.next();
    response.headers.set('x-user-id',       session.userId);
    response.headers.set('x-workspace-id',  session.workspaceId);
    response.headers.set('x-user-role',     session.role);
    response.headers.set('x-user-name',     session.name);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhook).*)'],
};
