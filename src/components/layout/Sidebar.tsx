'use client';

import Link      from 'next/link';
import { usePathname } from 'next/navigation';
import { cn }    from '@/lib/utils';
import { logout } from '@/actions/auth';

const NAV = [
  { href: '/dashboard',          label: 'Overview',  icon: '◈' },
  { href: '/dashboard/projects', label: 'Projects',  icon: '⬡' },
  { href: '/dashboard/builds',   label: 'Builds',    icon: '⬢' },
  { href: '/dashboard/members',  label: 'Members',   icon: '◎' },
  { href: '/dashboard/settings', label: 'Settings',  icon: '⚙' },
];

interface SidebarProps { workspaceName: string; userName: string; }

export function Sidebar({ workspaceName, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Logo / Workspace */}
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            N
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{workspaceName}</p>
            <p className="text-xs text-gray-400">Nexus</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
            {userName[0]?.toUpperCase()}
          </div>
          <span className="truncate text-sm text-gray-700 dark:text-gray-300">{userName}</span>
        </div>
        <form action={logout}>
          <button type="submit" className="w-full rounded-lg px-3 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
