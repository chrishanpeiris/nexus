'use client';

import { useFormState } from 'react-dom';
import Link               from 'next/link';
import { login }          from '@/actions/auth';
import { Button }         from '@/components/ui/Button';
import { Input }          from '@/components/ui/Input';
import type { ActionResult } from '@/types';

export default function LoginPage() {
  const [state, action, pending] = useFormState<ActionResult | null, FormData>(login, null);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
      <h2 className="mb-1 text-xl font-semibold text-white">Sign in</h2>
      <p className="mb-6 text-sm text-gray-400">Enter your credentials to access your workspace.</p>

      <form action={action} className="space-y-4">
        <Input label="Email" name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
        <Input label="Password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />

        {state && !state.ok && (
          <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have a workspace?{' '}
        <Link href="/register" className="text-brand-400 hover:underline">Create one</Link>
      </p>
    </div>
  );
}
