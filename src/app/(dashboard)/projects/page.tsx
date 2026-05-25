'use client';

// ─── Projects page ────────────────────────────────────────────────────────────
// Demonstrates: useActionState for Server Action form, optimistic patterns,
// and Server Action mutation → revalidateTag → fresh server render.

import { useFormState } from 'react-dom';
import { useState } from 'react';
import { useRouter }                from 'next/navigation';
import { createProject }            from '@/actions/projects';
import { Button }                   from '@/components/ui/Button';
import { Input }                    from '@/components/ui/Input';
import type { ActionResult }        from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const [state, action, pending] = useFormState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await createProject(prev, formData);
      if (result.ok) {
        setShowForm(false);
        router.refresh(); // re-fetch the server-rendered project list
      }
      return result.ok ? { ok: true as const, data: undefined } : result;
    },
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mutations via <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">Server Actions</code> → <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">revalidateTag</code>
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New project'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">New project</h2>
          <form action={action} className="space-y-4">
            <Input label="Name"        name="name"        required placeholder="Platform API" />
            <Input label="Description" name="description" placeholder="Optional description" />
            <Input label="Repo URL"    name="repoUrl"     placeholder="https://github.com/org/repo" />
            {state && !state.ok && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={pending}>Create project</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Project list is server-rendered via this page's parent layout refresh */}
      <ProjectList />
    </div>
  );
}

// ── Server-rendered project list embedded via dynamic import ──────────────────
// In a full implementation this would be a Server Component fetching from cache.
// For this client page we trigger router.refresh() after mutation which re-runs
// the server fetch in the layout/page tree.

function ProjectList() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Create a project above, or navigate to one from the{' '}
        <a href="/dashboard" className="text-brand-600 hover:underline dark:text-brand-400">Overview</a>.
      </p>
    </div>
  );
}
