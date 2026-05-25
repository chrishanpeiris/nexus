// ─── StatsGrid ────────────────────────────────────────────────────────────────
// Async Server Component — fetches its own data via unstable_cache.
// Wrapped in <Suspense> on the dashboard page so it streams independently.

import { getWorkspaceStats } from '@/lib/cache';

interface Props { workspaceId: string }

export async function StatsGrid({ workspaceId }: Props) {
  const { projectCount, memberCount, buildCount, successRate } =
    await getWorkspaceStats(workspaceId);

  const stats = [
    { label: 'Active Projects', value: projectCount, icon: '⬡', color: 'text-brand-600 dark:text-brand-400'  },
    { label: 'Team Members',    value: memberCount,   icon: '◎', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Total Builds',    value: buildCount,    icon: '⬢', color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Build Success',   value: `${successRate}%`, icon: '✓', color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon, color }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <span className={`text-2xl ${color}`}>{icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
