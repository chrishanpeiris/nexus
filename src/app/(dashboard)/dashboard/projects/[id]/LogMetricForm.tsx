'use client';

import { useFormState } from 'react-dom';
import { logMetric }        from '@/actions/projects';
import { Button }           from '@/components/ui/Button';
import { Input }            from '@/components/ui/Input';
import type { ActionResult } from '@/types';

const METRIC_TYPES = [
  { value: 'VELOCITY',    label: '⚡ Velocity (pts/sprint)' },
  { value: 'QUALITY',     label: '✓ Quality score' },
  { value: 'UPTIME',      label: '◎ Uptime (%)' },
  { value: 'DEPLOYMENTS', label: '⬢ Deploys / week' },
  { value: 'COVERAGE',    label: '◈ Test coverage (%)' },
];

export function LogMetricForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useFormState<ActionResult | null, FormData>(logMetric, null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Log a metric</h2>
      <form action={action} className="flex flex-wrap gap-3">
        <input type="hidden" name="projectId" value={projectId} />

        <select
          name="type"
          required
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {METRIC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <Input name="value" type="number" step="any" placeholder="42" required className="w-28" />
        <Input name="note"  type="text"   placeholder="Optional note" className="flex-1 min-w-32" />

        {state && !state.ok && (
          <p className="w-full text-sm text-red-500">{state.error}</p>
        )}
        {state?.ok && (
          <p className="w-full text-sm text-green-500">Metric logged! Cache revalidated.</p>
        )}

        <Button type="submit" size="sm" loading={pending}>Log metric</Button>
      </form>
    </div>
  );
}
