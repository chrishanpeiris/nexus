// ─── Project detail (Server Component + Server Action form) ──────────────────

import { notFound, redirect }  from 'next/navigation';
import { headers }             from 'next/headers';
import type { Metadata }       from 'next';
import { prisma }              from '@/lib/db';
import { getProjectMetrics }   from '@/lib/cache';
import { timeAgo }             from '@/lib/utils';
import { Badge }               from '@/components/ui/Badge';
import { LogMetricForm }       from './LogMetricForm';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }    = await params;
  const project   = await prisma.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project?.name ?? 'Project' };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id }        = await params;
  const hdrs          = await headers();
  const workspaceId   = hdrs.get('x-workspace-id');
  if (!workspaceId) redirect('/login');

  // Direct Prisma query in a Server Component — no API route needed
  const project = await prisma.project.findFirst({
    where: { id, workspaceId },
  });
  if (!project) notFound();

  // Cached metrics
  const metrics = await getProjectMetrics(id);

  const METRIC_LABELS: Record<string, string> = {
    VELOCITY:    '⚡ Velocity',
    QUALITY:     '✓ Quality',
    UPTIME:      '◎ Uptime',
    DEPLOYMENTS: '⬢ Deploys/wk',
    COVERAGE:    '◈ Coverage',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400">
            {project.repoUrl}
          </a>
        )}
      </div>

      {/* Log metric — Server Action form */}
      <LogMetricForm projectId={project.id} />

      {/* Metrics history */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Metrics history</h2>
          <p className="text-xs text-gray-400">Cached with <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">unstable_cache</code>, revalidated on each log</p>
        </div>
        {metrics.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">No metrics logged yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {metrics.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {METRIC_LABELS[m.type] ?? m.type}
                  </span>
                  {m.note && <p className="text-xs text-gray-400">{m.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{m.value}</p>
                  <p className="text-xs text-gray-400">{timeAgo(m.recordedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
