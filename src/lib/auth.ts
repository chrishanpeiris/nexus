// ─── Auth helpers ─────────────────────────────────────────────────────────────
// jose is used throughout (including Edge Middleware) because it's a pure-JS
// JWT library that works in both the Node.js and Edge runtimes.

import { SignJWT, jwtVerify } from 'jose';
import { cookies }            from 'next/headers';
import type { SessionUser }   from '@/types';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-minimum-32-characters!!',
);

const COOKIE = 'nexus-session';
const TTL_S  = 60 * 60 * 24 * 7; // 7 days

// ── Sign ─────────────────────────────────────────────────────────────────────

export async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_S}s`)
    .sign(SECRET);
}

// ── Verify ───────────────────────────────────────────────────────────────────
// Safe to call from Edge Middleware — no Node.js APIs used.

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// ── Cookie helpers (Node.js runtime only) ────────────────────────────────────

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signToken(user);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   TTL_S,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

// ── getSession — read current user in Server Components / Actions ─────────────

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ── requireSession — throws redirect if not authed ───────────────────────────
// Use inside Server Components that the middleware might have missed.

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    // Dynamic import avoids pulling 'next/navigation' into Edge bundles
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }
  return session as SessionUser;
}
