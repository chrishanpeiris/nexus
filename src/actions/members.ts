'use server';

// ─── Member Server Actions ────────────────────────────────────────────────────

import { revalidateTag }     from 'next/cache';
import bcrypt                from 'bcrypt';
import { prisma }            from '@/lib/db';
import { getSession }        from '@/lib/auth';
import { tags }              from '@/lib/cache';
import type { ActionResult } from '@/types';

// ── Invite (create) member ────────────────────────────────────────────────────
// In a real app this would send an email invite. Here we create the account
// immediately — demonstrates the Server Action pattern clearly.

export async function inviteMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Unauthenticated.' };
  if (session.role === 'MEMBER') return { ok: false, error: 'Insufficient permissions.' };

  const name     = (formData.get('name')     as string)?.trim();
  const email    = (formData.get('email')    as string)?.trim().toLowerCase();
  const role     = (formData.get('role')     as string) ?? 'MEMBER';
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { ok: false, error: 'Name, email, and password are required.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'Email already in use.' };

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role:        role as import('@prisma/client').Role,
      workspaceId: session.workspaceId,
    },
  });

  revalidateTag(tags.workspace(session.workspaceId));
  return { ok: true, data: undefined };
}

// ── Remove member ─────────────────────────────────────────────────────────────

export async function removeMember(memberId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Unauthenticated.' };
  if (session.role === 'MEMBER') return { ok: false, error: 'Insufficient permissions.' };
  if (memberId === session.userId) return { ok: false, error: 'Cannot remove yourself.' };

  await prisma.user.deleteMany({
    where: { id: memberId, workspaceId: session.workspaceId },
  });

  revalidateTag(tags.workspace(session.workspaceId));
  return { ok: true, data: undefined };
}
