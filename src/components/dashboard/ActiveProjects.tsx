// ─── ActiveProjects ───────────────────────────────────────────────────────────
// Async Server Component — streams independently via <Suspense>.

import Link                          from 'next/link';
import { getActiveProjects }         from '@/lib/cache';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface Props { workspaceId: string }

export async function ActiveProjects({ workspaceId }: Props) {
  const projects = await getActiveProjects(workspaceId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Active Projects</h2>
          <Link href="/dashboard/projects" className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {projects.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-gray-400">No projects yet.</p>
            <Link href="/dashboard/projects" className="mt-2 text-sm text-brand-600 hover:underline dark:text-brand-400">
              Create your first project →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                    {p.description && (
                      <p className="truncate text-xs text-gray-400">{p.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {p._count.metrics} metric{p._count.metrics !== 1 ? 's' : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export function ActiveProjectsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </CardHeader>
      <CardBody className="space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
