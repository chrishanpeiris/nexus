# Testing — Nexus

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Unit | **Vitest** | Pure functions, JWT helpers, cache tags |
| Integration | **Vitest** | Edge Middleware routing rules |
| E2E | **Playwright** | Auth flow, dashboard navigation, streaming assertions |

---

## Commands

```bash
npm test                # unit + integration (vitest run)
npm run test:watch      # watch mode
npm run test:coverage   # coverage report → coverage/
npm run test:e2e        # Playwright (starts dev server automatically)
npm run test:e2e:ui     # Playwright with interactive UI
```

---

## Unit tests — `src/__tests__/`

### `lib/utils.test.ts` — Pure functions
No mocks needed. Tests `timeAgo`, `slugify`, and `formatDuration`.

```ts
// timeAgo uses fake timers to pin "now"
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));

expect(timeAgo(new Date('2025-01-15T11:45:00Z'))).toBe('15m ago');
expect(slugify('Acme Engineering')).toBe('acme-engineering');
expect(formatDuration(90)).toBe('1m 30s');
```

### `lib/auth.test.ts` — JWT sign / verify
Tests the `jose`-based JWT helpers that power Edge Middleware auth.
No mocks — calls the real `signToken` / `verifyToken` functions.

```ts
const token  = await signToken(SAMPLE_USER);
const result = await verifyToken(token);
expect(result?.userId).toBe('user_123');       // roundtrip

const tampered = token.slice(0, -4) + 'xxxx';
expect(await verifyToken(tampered)).toBeNull(); // rejects invalid sig
```

Key cases:
- Valid token → decoded payload matches input
- Tampered signature → `null`
- Invalid string → `null`
- Different users → different tokens

### `lib/cache.test.ts` — Cache tag factory
Tags must be consistent between reads (cached calls) and writes
(`revalidateTag`). A typo breaks cache invalidation silently.

```ts
expect(tags.workspace('ws_1')).toBe('workspace-ws_1');
expect(tags.workspace('ws_1')).not.toBe(tags.projects('ws_1'));
```

### `middleware.test.ts` — Edge Middleware routing
Calls the real `middleware()` function with mock `NextRequest` objects.

```ts
// Unauthenticated → redirect
const req = makeRequest('/dashboard');          // no cookie
const res = await middleware(req);
expect(res.status).toBe(307);
expect(res.headers.get('location')).toContain('/login');

// Authenticated → headers forwarded
const authedReq = makeRequest('/dashboard', validToken);
const authedRes = await middleware(authedReq);
expect(authedRes.headers.get('x-workspace-id')).toBe('ws1');
```

Key cases:
- Unauthenticated → `/dashboard` redirects to `/login?from=...`
- Authenticated → `/login` redirects to `/dashboard`
- Authenticated → `/dashboard` passes through with `x-user-*` headers
- Public routes (`/`, `/team/[slug]`) always pass through

---

## E2E tests — `e2e/`

### `auth.spec.ts`

**Auth flow:**
- Landing page publicly accessible
- `/dashboard` redirects unauthenticated user to `/login`
- Invalid credentials shows error message
- Valid login redirects to `/dashboard`
- Authenticated user visiting `/login` redirects to `/dashboard`

**Dashboard navigation:**
- Sidebar shows workspace name from seeded data
- Each nav link navigates to correct URL
- Sign out redirects to `/login`

**Streaming assertions:**
- Stats cards are visible after Suspense resolves (`timeout: 10_000`)
- Recent Builds section streams in
- Active Projects section streams in

---

## Setup files

### `src/__tests__/setup.ts`
Mocks Next.js server-only modules so unit tests can `import` lib files:

```ts
vi.mock('next/cache', () => ({
  revalidateTag:  vi.fn(),
  unstable_cache: vi.fn((fn) => fn),  // pass-through: calls fn directly
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
  headers: vi.fn(() => ({ get: vi.fn() })),
}));
```

The `unstable_cache` mock is a pass-through — it returns the wrapped
function directly so tests get real data from the mocked Prisma calls
without dealing with cache internals.

---

## Adding new tests

### Testing a Server Action

```ts
import { vi, describe, it, expect } from 'vitest';

// 1. Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: { project: { create: vi.fn(), findFirst: vi.fn() } },
}));
// 2. Mock getSession to return a fake user
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => ({ userId: 'u1', workspaceId: 'ws1', role: 'OWNER' })),
}));

import { createProject } from '@/actions/projects';
import { prisma }        from '@/lib/db';

it('creates a project and revalidates the tag', async () => {
  vi.mocked(prisma.project.create).mockResolvedValue({ id: 'proj_1', name: 'API' } as any);

  const fd = new FormData();
  fd.set('name', 'API');

  const result = await createProject(null, fd);
  expect(result.ok).toBe(true);
  expect(vi.mocked(prisma.project.create)).toHaveBeenCalledOnce();
});
```

### Testing the webhook Route Handler

```ts
import { POST } from '@/app/api/webhook/ci/route';
import { NextRequest } from 'next/server';

it('returns 400 when status is missing', async () => {
  const req = new NextRequest('http://localhost/api/webhook/ci', {
    method:  'POST',
    headers: { 'x-workspace-id': 'ws_1', 'Content-Type': 'application/json' },
    body:    JSON.stringify({ project: 'api' }), // no status
  });
  const res = await POST(req);
  expect(res.status).toBe(400);
});
```

---

## Prerequisites

```bash
# Install Playwright browsers (once)
npx playwright install chromium

# E2E tests need seeded data
docker compose up -d
npx prisma migrate dev
npm run db:seed

# Then run E2E
npm run test:e2e
```
