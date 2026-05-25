'use server';

// ─── Settings Server Actions ──────────────────────────────────────────────────

import { revalidateTag }     from 'next/cache';
import { prisma }            from '@/lib/db';
import { getSession }        from '@/lib/auth';
import { slugify }           from '@/lib/utils';
import { tags }              from '@/lib/cache';
import type { ActionResult } from '@/types';

export async function updateWorkspace(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Unauthenticated.' };
  if (session.role === 'MEMBER') return { ok: false, error: 'Insufficient permissions.' };

  const name     = (formData.get('name')     as string)?.trim();
  const isPublic = formData.get('isPublic') === 'true';
  const plan     = formData.get('plan') as string | null;

  if (!name) return { ok: false, error: 'Workspace name is required.' };

  const slug = slugify(name);

  // Check slug uniqueness (excluding current workspace)
  const conflict = await prisma.workspace.findFirst({
    where: { slug, NOT: { id: session.workspaceId } },
  });
  if (conflict) return { ok: false, error: 'Workspace name already taken.' };

  await prisma.workspace.update({
    where: { id: session.workspaceId },
    data:  {
      name,
      slug,
      isPublic,
      ...(plan ? { plan: plan as import('@prisma/client').Plan } : {}),
    },
  });

  // Invalidate workspace cache AND the public team page
  revalidateTag(tags.workspace(session.workspaceId));
  revalidateTag(tags.publicTeam(slug));

  return { ok: true, data: undefined };
}
