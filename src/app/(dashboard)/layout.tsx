// ─── Dashboard layout ─────────────────────────────────────────────────────────
// Server Component. By the time this runs, middleware has already verified the
// JWT and forwarded x-user-* headers — no DB call needed just for identity.

import { headers }  from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar }  from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Read identity from headers set by Edge Middleware
  const hdrs          = await headers();
  const workspaceId   = hdrs.get('x-workspace-id');
  const userName      = hdrs.get('x-user-name') ?? 'Unknown';

  // Fallback — middleware should have caught this, but guard just in case
  if (!workspaceId) redirect('/login');

  // Minimal workspace name fetch — only runs once per layout, cached by React
  const { prisma } = await import('@/lib/db');
  const workspace  = await prisma.workspace.findUnique({
    where:  { id: workspaceId },
    select: { name: true },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar workspaceName={workspace?.name ?? 'Workspace'} userName={userName} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
