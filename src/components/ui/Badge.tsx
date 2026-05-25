import { cn } from '@/lib/utils';
import type { BuildStatus, ProjectStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'red' | 'yellow' | 'blue' | 'purple';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      {
        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300':    variant === 'gray',
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400': variant === 'green',
        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400':     variant === 'red',
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400': variant === 'yellow',
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400': variant === 'blue',
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400': variant === 'purple',
      },
      className,
    )}>
      {children}
    </span>
  );
}

export function BuildStatusBadge({ status }: { status: BuildStatus }) {
  const map: Record<BuildStatus, { label: string; variant: BadgeProps['variant'] }> = {
    SUCCESS:   { label: '✓ Success',   variant: 'green'  },
    FAILURE:   { label: '✕ Failed',    variant: 'red'    },
    PENDING:   { label: '◌ Pending',   variant: 'yellow' },
    CANCELLED: { label: '⊘ Cancelled', variant: 'gray'   },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'green' : 'gray'}>
      {status === 'ACTIVE' ? 'Active' : 'Archived'}
    </Badge>
  );
}
