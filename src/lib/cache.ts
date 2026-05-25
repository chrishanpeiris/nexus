// ─── Cache layer ─────────────────────────────────────────────────────────────
// unstable_cache wraps expensive Prisma queries so they are memoised across
// requests and invalidated by tag when data changes.
//
// Pattern:
//   • Read  → unstable_cache (tagged)
//   • Write → Server Action calls revalidateTag(tag)
//   • Webhook → Route Handler calls revalidateTag(tag)
//
// This is exactly the "caching strategies" the article refers to as senior skill.

import { unstable_cache } from 'next/cache';
import { prisma }         from './db';

// Tag factory — keeps tag strings consistent across reads and writes
export const tags = {
  workspace:  (id: string) => `workspace-${id}`,
  projects:   (workspaceId: string) => `projects-${workspaceId}`,
  builds:     (workspaceId: string) => `builds-${workspaceId}`,
  metrics:    (projectId: string)   => `metrics-${projectId}`,
  publicTeam: (slug: string)        => `team-${slug}`,
};

// ── Workspace stats (overview cards) ─────────────────────────────────────────

export const getWorkspaceStats = (workspaceId: string) =>
  unstable_cache(
    async () => {
      const [projectCount, memberCount, buildCount, recentBuilds] =
        await Promise.all([
          prisma.project.count({ where: { workspaceId, status: 'ACTIVE' } }),
          prisma.user.count({ where: { workspaceId } }),
          prisma.build.count({ where: { workspaceId } }),
          prisma.build.findMany({
            where:   { workspaceId },
            orderBy: { triggeredAt: 'desc' },
            take:    10,
            select:  { status: true },
          }),
        ]);

      const successRate =
        recentBuilds.length === 0
          ? 100
          : Math.round(
              (recentBuilds.filter((b) => b.status === 'SUCCESS').length /
                recentBuilds.length) *
                100,
            );

      return { projectCount, memberCount, buildCount, successRate };
    },
    [`workspace-stats-${workspaceId}`],
    { tags: [tags.workspace(workspaceId)], revalidate: 60 },
  )();

// ── Recent builds ─────────────────────────────────────────────────────────────

export const getRecentBuilds = (workspaceId: string, limit = 8) =>
  unstable_cache(
    async () =>
      prisma.build.findMany({
        where:   { workspaceId },
        orderBy: { triggeredAt: 'desc' },
        take:    limit,
      }),
    [`recent-builds-${workspaceId}-${limit}`],
    { tags: [tags.builds(workspaceId)], revalidate: 30 },
  )();

// ── Active projects ───────────────────────────────────────────────────────────

export const getActiveProjects = (workspaceId: string) =>
  unstable_cache(
    async () =>
      prisma.project.findMany({
        where:   { workspaceId, status: 'ACTIVE' },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { metrics: true } } },
      }),
    [`active-projects-${workspaceId}`],
    { tags: [tags.projects(workspaceId)], revalidate: 60 },
  )();

// ── Project metrics ───────────────────────────────────────────────────────────

export const getProjectMetrics = (projectId: string, limit = 20) =>
  unstable_cache(
    async () =>
      prisma.metric.findMany({
        where:   { projectId },
        orderBy: { recordedAt: 'desc' },
        take:    limit,
      }),
    [`metrics-${projectId}-${limit}`],
    { tags: [tags.metrics(projectId)], revalidate: 60 },
  )();

// ── Public team page ──────────────────────────────────────────────────────────

export const getPublicTeam = (slug: string) =>
  unstable_cache(
    async () =>
      prisma.workspace.findUnique({
        where:   { slug, isPublic: true },
        include: {
          projects: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } },
          _count:   { select: { users: true } },
        },
      }),
    [`public-team-${slug}`],
    { tags: [tags.publicTeam(slug)], revalidate: 3600 },
  )();
