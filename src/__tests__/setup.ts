// ─── Vitest global setup ──────────────────────────────────────────────────────

import { vi, afterEach } from 'vitest';

// Mock Next.js server-only modules so lib files can be imported in tests
vi.mock('next/cache', () => ({
  revalidateTag:  vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}));

vi.mock('next/navigation', () => ({
  redirect:       vi.fn(),
  useRouter:      vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() })),
  usePathname:    vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get:    vi.fn(),
    set:    vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => ({ get: vi.fn() })),
}));

afterEach(() => {
  vi.clearAllMocks();
});
