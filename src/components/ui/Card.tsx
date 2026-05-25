import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-gray-200 px-5 py-4 dark:border-gray-700', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

// Skeleton placeholder used inside Suspense fallbacks
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardBody className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" style={{ width: `${60 + (i % 3) * 15}%` }} />
        ))}
      </CardBody>
    </Card>
  );
}
