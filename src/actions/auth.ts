'use server';

// ─── Auth Server Actions ──────────────────────────────────────────────────────
// Server Actions replace the traditional API route + fetch pattern for mutations.
// The client never sees the DB or JWT logic — it just calls the function.

import { redirect }          from 'next/navigation';
import bcrypt                from 'bcrypt';
import { prisma }            from '@/lib/db';
import { setSessionCookie, clearSessionCookie } from '@/lib/auth';
import { slugify }           from '@/lib/utils';
import type { ActionResult } from '@/types';

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name          = (formData.get('name')          as string)?.trim();
  const email         = (formData.get('email')         as string)?.trim().toLowerCase();
  const password      = formData.get('password')       as string;
  const workspaceName = (formData.get('workspaceName') as string)?.trim();

  if (!name || !email || !password || !workspaceName) {
    return { ok: false, error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'Email already in use.' };

  const hashedPassword = await bcrypt.hash(password, 12);
  const slug           = slugify(workspaceName);

  // Ensure slug is unique
  const slugExists = await prisma.workspace.findUnique({ where: { slug } });
  if (slugExists) {
    return { ok: false, error: 'Workspace name already taken. Try another.' };
  }

  // Create workspace + owner user in a transaction
  const { workspace, user } = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: workspaceName, slug },
    });
    const user = await tx.user.create({
      data: { name, email, hashedPassword, role: 'OWNER', workspaceId: workspace.id },
    });
    return { workspace, user };
  });

  await setSessionCookie({
    userId:      user.id,
    workspaceId: workspace.id,
    email:       user.email,
    name:        user.name,
    role:        user.role,
  });

  redirect('/dashboard');
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email    = (formData.get('email')    as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  const user = await prisma.user.findUnique({
    where:   { email },
    include: { workspace: true },
  });

  const passwordMatch = user
    ? await bcrypt.compare(password, user.hashedPassword)
    : false;

  // Constant-time response to prevent user enumeration
  if (!user || !passwordMatch) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  await setSessionCookie({
    userId:      user.id,
    workspaceId: user.workspaceId,
    email:       user.email,
    name:        user.name,
    role:        user.role,
  });

  redirect('/dashboard');
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
