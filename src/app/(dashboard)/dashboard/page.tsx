// ─── Dashboard overview (streaming) ──────────────────────────────────────────
// This is the centrepiece of the article's thesis:
//
//   • This is a Server Component — no useState, no useEffect, no client bundle
//   • Each widget is wrapped in <Suspense> — they stream in independently
//   • The page shell renders immediately; slow widgets don't block fast ones
//   • Data is fetched inside the widget components via unstable_cache
//
// The entire page is server-rendered. React progressively sends HTML chunks
// over the same HTTP connection as each Suspense boundary resolves.

import { Suspense }            from 'react';
import { headers }             from 'next/headers';
import { redirect }            from 'next/navigation';
import type { Metadata }       from 'next';
import { StatsGrid, StatsGridSkeleton }         from '@/components/dashboard/StatsGrid';
import { RecentBuilds, RecentBuildsSkeleton }   from '@/components/dashboard/RecentBuilds';
import { ActiveProjects, ActiveProjectsSkeleton } from '@/components/dashboard/ActiveProjects';

export const metadata: Metadata = { title: 'Overview' };

export default async function DashboardPage() {
  const hdrs        = await headers();
  const workspaceId = hdrs.get('x-workspace-id');
  if (!workspaceId) redirect('/login');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Workspace health at a glance · data from <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">unstable_cache</code>
        </p>
      </div>

      {/* Stats — streams first (fastest query) */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid workspaceId={workspaceId} />
      </Suspense>

      {/* Two-column grid — builds and projects stream independently */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<RecentBuildsSkeleton />}>
          <RecentBuilds workspaceId={workspaceId} />
        </Suspense>

        <Suspense fallback={<ActiveProjectsSkeleton />}>
          <ActiveProjects workspaceId={workspaceId} />
        </Suspense>
      </div>

      {/* Architecture callout */}
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5 text-sm text-brand-300">
        <p className="font-semibold mb-1">⚡ What you&apos;re seeing</p>
        <p className="leading-relaxed text-brand-400/80">
          This page is a <strong className="text-brand-300">Server Component</strong> with zero client JS for data.
          The three sections above are each wrapped in <code className="rounded bg-brand-500/10 px-1 text-xs">&lt;Suspense&gt;</code> — they
          stream in as their <strong className="text-brand-300">async Server Component</strong> children resolve.
          Data is served from <code className="rounded bg-brand-500/10 px-1 text-xs">unstable_cache</code> and
          invalidated via <code className="rounded bg-brand-500/10 px-1 text-xs">revalidateTag</code> on every write.
        </p>
      </div>
    </div>
  );
}
