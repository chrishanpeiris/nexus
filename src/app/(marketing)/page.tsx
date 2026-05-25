// ─── Landing page (static) ────────────────────────────────────────────────────
// Statically generated at build time — no DB calls, no auth.
// Demonstrates: generateStaticParams is NOT needed here (no dynamic segments),
// but this page is a zero-JS Server Component by default.

import type { Metadata } from 'next';
import Link              from 'next/link';

export const metadata: Metadata = {
  title:       'Nexus — Team Dev Dashboard',
  description: 'Track projects, metrics, and CI builds. Built on Next.js 14 App Router.',
};

const FEATURES = [
  {
    icon:  '⚡',
    title: 'Edge Middleware',
    desc:  'JWT auth verified at the edge before any route runs — zero DB roundtrips for auth.',
  },
  {
    icon:  '⬡',
    title: 'Server Components',
    desc:  'Dashboard widgets query the database directly inside the component — no useEffect, no API waterfalls.',
  },
  {
    icon:  '◈',
    title: 'Server Actions',
    desc:  'All mutations are Server Actions. No API routes for CRUD — the client calls a function.',
  },
  {
    icon:  '▶',
    title: 'Streaming + Suspense',
    desc:  'Dashboard shell renders instantly. Each widget streams in independently as data resolves.',
  },
  {
    icon:  '◎',
    title: 'Cache + revalidateTag',
    desc:  'unstable_cache with per-workspace tags. Writes call revalidateTag — stale data is impossible.',
  },
  {
    icon:  '⬢',
    title: 'Route Handlers + Webhooks',
    desc:  'POST /api/webhook/ci ingests CI builds, persists to DB, and revalidates the dashboard cache.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-white">
          <span className="mr-1.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold">N</span>
          Nexus
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login"    className="text-sm text-gray-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400">
          <span>⚡</span> Built with Next.js 14 App Router
        </div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          Where the frontend<br />
          <span className="text-brand-400">meets the server</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Nexus is a team dev dashboard that demonstrates every Next.js 14 server capability
          in production — Edge Middleware, Server Components, Server Actions, Streaming,
          caching strategies, and webhook-driven revalidation.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="rounded-xl bg-brand-600 px-8 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors">
            Create your workspace
          </Link>
          <Link href="/login" className="rounded-xl border border-gray-700 px-8 py-3 text-base font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-3 text-2xl">{icon}</div>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        Nexus · Portfolio Project 5 · Next.js 14 · TypeScript · PostgreSQL · Redis
      </footer>
    </div>
  );
}
