// ─── CI Webhook Route Handler ─────────────────────────────────────────────────
// This is what the article means by "Route Handlers."
//
// Flow:
//   1. CI system (GitHub Actions, CircleCI, etc.) POSTs a build event
//   2. Route Handler parses + validates the payload (Node.js runtime — full APIs)
//   3. Saves the build to Postgres via Prisma
//   4. Calls revalidateTag → invalidates the builds + workspace cache
//   5. Next visit to the dashboard shows fresh data — no manual refresh needed
//
// Rate limiting uses Redis (ioredis) — only possible because this runs in
// Node.js runtime, not the Edge runtime.

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag }             from 'next/cache';
import { prisma }                    from '@/lib/db';
import { checkRateLimit }            from '@/lib/redis';
import { tags }                      from '@/lib/cache';
import type { BuildStatus }          from '@/types';

interface WebhookPayload {
  project:   string;
  branch?:   string;
  status:    BuildStatus;
  duration?: number;
  commitSha?: string;
}

const VALID_STATUSES: BuildStatus[] = ['SUCCESS', 'FAILURE', 'PENDING', 'CANCELLED'];

export async function POST(request: NextRequest) {
  // ── Rate limiting (5 requests / 10s per workspace) ───────────────────────
  const workspaceId = request.headers.get('x-workspace-id');
  if (!workspaceId) {
    return NextResponse.json(
      { error: 'Missing x-workspace-id header' },
      { status: 400 },
    );
  }

  const { allowed, remaining } = await checkRateLimit(
    `webhook:${workspaceId}`,
    5,
    10_000,
  );

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0' },
      },
    );
  }

  // ── Validate workspace exists ────────────────────────────────────────────
  const workspace = await prisma.workspace.findUnique({
    where:  { id: workspaceId },
    select: { id: true },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // ── Parse + validate payload ─────────────────────────────────────────────
  let payload: WebhookPayload;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload.project || !payload.status) {
    return NextResponse.json(
      { error: 'project and status are required' },
      { status: 400 },
    );
  }

  if (!VALID_STATUSES.includes(payload.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  // ── Persist build ────────────────────────────────────────────────────────
  const build = await prisma.build.create({
    data: {
      project:     payload.project,
      branch:      payload.branch    ?? 'main',
      status:      payload.status,
      duration:    payload.duration  ?? null,
      commitSha:   payload.commitSha ?? null,
      workspaceId,
    },
  });

  // ── Revalidate cache ─────────────────────────────────────────────────────
  // Any cached query tagged with builds-{id} or workspace-{id} is now stale.
  // Next.js will re-fetch on the next request.
  revalidateTag(tags.builds(workspaceId));
  revalidateTag(tags.workspace(workspaceId));

  return NextResponse.json(
    {
      ok:      true,
      buildId: build.id,
      message: 'Build recorded. Dashboard cache revalidated.',
      rateLimit: { remaining },
    },
    {
      status:  201,
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    },
  );
}
