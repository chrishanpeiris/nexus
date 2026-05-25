// ─── Middleware logic tests ───────────────────────────────────────────────────
// Tests the routing rules (redirect unauthenticated, redirect authed away from
// login) by calling the middleware function with mock NextRequest objects.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { signToken }   from '@/lib/auth';
import type { SessionUser } from '@/types';

// Import middleware after mocks are set up
import { middleware } from '@/middleware';

const SAMPLE_USER: SessionUser = {
  userId: 'u1', workspaceId: 'ws1',
  email: 'alice@acme.com', name: 'Alice', role: 'OWNER',
};

function makeRequest(pathname: string, token?: string): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  const req = new NextRequest(url);
  if (token) req.cookies.set('nexus-session', token);
  return req;
}

describe('middleware', () => {
  let validToken: string;

  beforeEach(async () => {
    validToken = await signToken(SAMPLE_USER);
  });

  // ── Unauthenticated → protected ────────────────────────────────────────────

  it('redirects unauthenticated request from /dashboard to /login', async () => {
    const req  = makeRequest('/dashboard');
    const res  = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirects unauthenticated request from /dashboard/projects to /login', async () => {
    const req = makeRequest('/dashboard/projects');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('preserves the original path as ?from= query param', async () => {
    const req      = makeRequest('/dashboard/settings');
    const res      = await middleware(req);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('from=%2Fdashboard%2Fsettings');
  });

  // ── Authenticated → auth pages ─────────────────────────────────────────────

  it('redirects authenticated user away from /login to /dashboard', async () => {
    const req = makeRequest('/login', validToken);
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  it('redirects authenticated user away from /register to /dashboard', async () => {
    const req = makeRequest('/register', validToken);
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  // ── Authenticated → dashboard ──────────────────────────────────────────────

  it('passes authenticated request to /dashboard through with user headers', async () => {
    const req = makeRequest('/dashboard', validToken);
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-user-id')).toBe(SAMPLE_USER.userId);
    expect(res.headers.get('x-workspace-id')).toBe(SAMPLE_USER.workspaceId);
    expect(res.headers.get('x-user-role')).toBe(SAMPLE_USER.role);
  });

  // ── Public routes ──────────────────────────────────────────────────────────

  it('allows unauthenticated access to the landing page', async () => {
    const req = makeRequest('/');
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it('allows unauthenticated access to public team pages', async () => {
    const req = makeRequest('/team/acme-engineering');
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
