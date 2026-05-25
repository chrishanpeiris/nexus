// ─── RecentBuilds ─────────────────────────────────────────────────────────────
// Async Server Component — streams independently via <Suspense>.

import { getRecentBuilds }  from '@/lib/cache';
import { BuildStatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { timeAgo, formatDuration }   from '@/lib/utils';

interface Props { workspaceId: string }

export async function RecentBuilds({ workspaceId }: Props) {
  const builds = await getRecentBuilds(workspaceId);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Builds</h2>
        <p className="text-xs text-gray-400 mt-0.5">Last {builds.length} CI runs · via webhook</p>
      </CardHeader>
      <CardBody className="p-0">
        {builds.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">
            No builds yet. Send a POST to <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-700">/api/webhook/ci</code> to record one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {builds.map((build) => (
              <li key={build.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {build.project}
                  </p>
                  <p className="text-xs text-gray-400">
                    {build.branch} · {timeAgo(build.triggeredAt)}
                    {build.duration !== null && ` · ${formatDuration(build.duration)}`}
                  </p>
                </div>
                <BuildStatusBadge status={build.status} />
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export function RecentBuildsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </CardHeader>
      <CardBody className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
