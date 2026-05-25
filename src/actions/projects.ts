'use server';

// ─── Project Server Actions ───────────────────────────────────────────────────

import { revalidateTag }     from 'next/cache';
import { prisma }            from '@/lib/db';
import { getSession }        from '@/lib/auth';
import { tags }              from '@/lib/cache';
import type { ActionResult } from '@/types';

// ── Create ────────────────────────────────────────────────────────────────────

export async function createProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Unauthenticated.' };

  const name        = (formData.get('name')        as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const repoUrl     = (formData.get('repoUrl')     as string)?.trim();

  if (!name) return { ok: false, error: 'Project name is required.' };

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      repoUrl:     repoUrl     || null,
      workspaceId: session.workspaceId,
    },
  });

  // Invalidate the projects cache — next read fetches fresh data from DB
  revalidateTag(tags.projects(session.workspaceId));
  revalidateTag(tags.workspace(session.workspaceId));

  return { ok: true, data: { id: project.id } };
}

// ── Archive ───────────────────────────────────────────────────────────────────

export async function archiveProject(projectId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Unauthenticated.' };

  await prisma.project.update({
    where: { id: projectId, workspaceId: session.workspaceId },
    data:  { status: 'ARCHIVED' },
  });

  revalidateTag(tags.projects(session.workspaceId));
  revalidateTag(tags.workspace(session.workspaceId));

  return { ok: true, data: undefined };
}

// ── Log metric ────────────────────────────────────────────────────────────────

export async function logMetric(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Unauthenticated.' };

  const projectId = formData.get('projectId') as string;
  const type      = formData.get('type')      as string;
  const value     = parseFloat(formData.get('value') as string);
  const note      = (formData.get('note') as string)?.trim();

  if (!projectId || !type || isNaN(value)) {
    return { ok: false, error: 'Project, type, and value are required.' };
  }

  // Verify the project belongs to this workspace
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: session.workspaceId },
  });
  if (!project) return { ok: false, error: 'Project not found.' };

  await prisma.metric.create({
    data: {
      projectId,
      type:  type as import('@prisma/client').MetricType,
      value,
      note:  note || null,
    },
  });

  revalidateTag(tags.metrics(projectId));
  revalidateTag(tags.workspace(session.workspaceId));

  return { ok: true, data: undefined };
}
