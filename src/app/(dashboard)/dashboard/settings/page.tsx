'use client';

import { useFormState } from 'react-dom';
import { updateWorkspace }   from '@/actions/settings';
import { Button }            from '@/components/ui/Button';
import { Input }             from '@/components/ui/Input';
import type { ActionResult } from '@/types';

export default function SettingsPage() {
  const [state, action, pending] = useFormState<ActionResult | null, FormData>(
    updateWorkspace,
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Server Action updates workspace + calls <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">revalidateTag</code> on public page
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">Workspace</h2>
        <form action={action} className="max-w-md space-y-4">
          <Input
            label="Workspace name"
            name="name"
            required
            placeholder="Acme Engineering"
            hint="Also updates your public URL slug"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
            <select name="plan" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              <option value="FREE">Free</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublic" name="isPublic" value="true" className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Make workspace public
              <span className="ml-1 text-xs text-gray-400">(enables /team/[slug] page with ISR)</span>
            </label>
          </div>

          {state && !state.ok && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          {state?.ok && (
            <p className="text-sm text-green-500">✓ Saved — public team page cache revalidated.</p>
          )}

          <Button type="submit" loading={pending}>Save changes</Button>
        </form>
      </div>
    </div>
  );
}
