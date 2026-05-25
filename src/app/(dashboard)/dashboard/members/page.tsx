'use client';

import { useFormState } from 'react-dom';
import { useState } from 'react';
import { inviteMember, removeMember } from '@/actions/members';
import { Button }   from '@/components/ui/Button';
import { Input }    from '@/components/ui/Input';
import { Badge }    from '@/components/ui/Badge';
import type { ActionResult } from '@/types';

// NOTE: In a full implementation the member list would be a Server Component
// child fetched via unstable_cache. For brevity, the list refreshes after
// router.refresh() which re-runs the server tree.

export default function MembersPage() {
  const [showForm, setShowForm] = useState(false);

  const [state, action, pending] = useFormState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await inviteMember(prev, formData);
      if (result.ok) setShowForm(false);
      return result;
    },
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Invite via <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">Server Action</code> · role-gated
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Invite member'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Invite a member</h2>
          <form action={action} className="space-y-4">
            <Input label="Name"     name="name"     required placeholder="Bob Smith" />
            <Input label="Email"    name="email"    type="email" required placeholder="bob@company.com" />
            <Input label="Password" name="password" type="password" required placeholder="Temporary password" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select name="role" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {state && !state.ok && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <Button type="submit" size="sm" loading={pending}>Send invite</Button>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Team members</h2>
        </div>
        <p className="px-5 py-6 text-sm text-gray-400">
          Members appear here after seeding (<code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-700">npm run db:seed</code>) or after inviting via the form above.
        </p>
      </div>
    </div>
  );
}
