// ─── Builds page (Server Component) ──────────────────────────────────────────
// Shows all CI builds ingested via the POST /api/webhook/ci Route Handler.

import { headers }          from 'next/headers';
import { redirect }         from 'next/navigation';
import type { Metadata }    from 'next';
import { prisma }           from '@/lib/db';
import { BuildStatusBadge } from '@/components/ui/Badge';
import { timeAgo, formatDuration } from '@/lib/utils';

export const metadata: Metadata = { title: 'Builds' };

export default async function BuildsPage() {
  const hdrs        = await headers();
  const workspaceId = hdrs.get('x-workspace-id');
  if (!workspaceId) redirect('/login');

  const builds = await prisma.build.findMany({
    where:   { workspaceId },
    orderBy: { triggeredAt: 'desc' },
    take:    50,
  });

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/webhook/ci`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CI Builds</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Populated via <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">POST /api/webhook/ci</code> Route Handler
        </p>
      </div>

      {/* Webhook usage card */}
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">
        <p className="mb-2 text-sm font-semibold text-brand-300">Send a build webhook</p>
        <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-300">
{`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-workspace-id: ${workspaceId}" \\
  -d '{"project":"my-api","branch":"main","status":"SUCCESS","duration":47}'`}
        </pre>
        <p className="mt-2 text-xs text-brand-400/70">
          The handler saves the build, then calls <code className="rounded bg-brand-500/10 px-1">revalidateTag</code> —
          the Overview dashboard updates on your next visit.
        </p>
      </div>

      {/* Build list */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Build history</h2>
        </div>
        {builds.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            No builds recorded yet. Use the curl command above to send your first webhook.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {builds.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{b.project}</p>
                  <p className="text-xs text-gray-400">
                    {b.branch}
                    {b.commitSha && ` · ${b.commitSha.slice(0, 7)}`}
                    {' · '}{timeAgo(b.triggeredAt)}
                    {b.duration !== null && ` · ${formatDuration(b.duration)}`}
                  </p>
                </div>
                <BuildStatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
