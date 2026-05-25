// ─── Public team page (ISR) ───────────────────────────────────────────────────
// Demonstrates:
//   • generateStaticParams — pre-renders all public workspaces at build time
//   • revalidate — Next.js revalidates after 1 hour in the background
//   • unstable_cache — tagged so settings changes trigger on-demand revalidation
//   • No auth required — this is public-facing

import { notFound }          from 'next/navigation';
import type { Metadata }     from 'next';
import { prisma }            from '@/lib/db';
import { getPublicTeam }     from '@/lib/cache';

// ── ISR config ────────────────────────────────────────────────────────────────
// Next.js will revalidate this page in the background at most every hour.
// On-demand revalidation via revalidateTag('team-[slug]') happens immediately
// when the workspace owner changes their settings.
export const revalidate    = 3600;
export const dynamicParams = true; // generate pages on-demand if not pre-built

// ── generateStaticParams ──────────────────────────────────────────────────────
// Called at build time. Returns slugs for all public workspaces.
// Next.js pre-renders a static HTML page for each one.
export async function generateStaticParams() {
  // Guard: DB may not be available at build time (CI without a running Postgres).
  // Return empty array — pages will be generated on-demand (ISR fallback: 'blocking').
  try {
    const workspaces = await prisma.workspace.findMany({
      where:  { isPublic: true },
      select: { slug: true },
    });
    return workspaces.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team     = await getPublicTeam(slug);
  if (!team) return { title: 'Team not found' };
  return {
    title:       `${team.name} · Nexus`,
    description: `${team.name} workspace on Nexus — ${team._count.users} members, ${team.projects.length} projects`,
  };
}

export default async function PublicTeamPage({ params }: Props) {
  const { slug } = await params;
  const team     = await getPublicTeam(slug);

  if (!team) notFound();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold">
              {team.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <p className="text-sm text-gray-400">{team._count.users} members · {team.plan} plan</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs text-brand-400">
            <span>⚡</span>
            ISR page · revalidates hourly or on settings change
          </div>
        </div>

        {/* Projects */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Projects ({team.projects.length})
          </h2>

          {team.projects.length === 0 ? (
            <p className="text-sm text-gray-500">No public projects yet.</p>
          ) : (
            <div className="space-y-3">
              {team.projects.map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{p.name}</h3>
                      {p.description && <p className="mt-0.5 text-sm text-gray-400">{p.description}</p>}
                    </div>
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 text-xs text-brand-400 hover:underline">
                        View repo →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-12 text-center text-xs text-gray-600">
          Powered by <a href="/" className="hover:text-gray-400">Nexus</a>
        </p>
      </div>
    </div>
  );
}
