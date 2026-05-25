'use client';

import { useFormState } from 'react-dom';
import Link               from 'next/link';
import { register }       from '@/actions/auth';
import { Button }         from '@/components/ui/Button';
import { Input }          from '@/components/ui/Input';
import type { ActionResult } from '@/types';

export default function RegisterPage() {
  const [state, action, pending] = useFormState<ActionResult | null, FormData>(register, null);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
      <h2 className="mb-1 text-xl font-semibold text-white">Create your workspace</h2>
      <p className="mb-6 text-sm text-gray-400">You&apos;ll be the workspace owner.</p>

      <form action={action} className="space-y-4">
        <Input label="Your name"       name="name"          type="text"  placeholder="Alice Chen"       required />
        <Input label="Email"           name="email"         type="email" placeholder="you@company.com"  required autoComplete="email" />
        <Input label="Password"        name="password"      type="password" placeholder="Min 8 characters" required autoComplete="new-password" />
        <Input label="Workspace name"  name="workspaceName" type="text"  placeholder="Acme Engineering"  required hint="Becomes your team slug (e.g. acme-engineering)" />

        {state && !state.ok && (
          <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          Create workspace
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have a workspace?{' '}
        <Link href="/login" className="text-brand-400 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
