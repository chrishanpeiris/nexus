// ─── Shared types ─────────────────────────────────────────────────────────────

import type { Plan, Role, BuildStatus, MetricType, ProjectStatus } from '@prisma/client';

export type { Plan, Role, BuildStatus, MetricType, ProjectStatus };

// JWT payload stored in the session cookie
export interface SessionUser {
  userId:      string;
  workspaceId: string;
  email:       string;
  name:        string;
  role:        Role;
}

// Server Action return shape
export type ActionResult<T = void> =
  | { ok: true;  data: T }
  | { ok: false; error: string };
