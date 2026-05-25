import { describe, it, expect } from 'vitest';
import { tags } from '@/lib/cache';

// ── tags factory ──────────────────────────────────────────────────────────────
// These strings are used as revalidateTag() arguments.
// A typo here breaks cache invalidation silently — worth testing explicitly.

describe('cache tags factory', () => {
  it('workspace tag includes the workspace id', () => {
    expect(tags.workspace('ws_123')).toBe('workspace-ws_123');
  });

  it('projects tag includes the workspace id', () => {
    expect(tags.projects('ws_abc')).toBe('projects-ws_abc');
  });

  it('builds tag includes the workspace id', () => {
    expect(tags.builds('ws_def')).toBe('builds-ws_def');
  });

  it('metrics tag includes the project id', () => {
    expect(tags.metrics('proj_xyz')).toBe('metrics-proj_xyz');
  });

  it('publicTeam tag includes the slug', () => {
    expect(tags.publicTeam('acme-engineering')).toBe('team-acme-engineering');
  });

  it('different ids produce different tags', () => {
    expect(tags.workspace('ws_1')).not.toBe(tags.workspace('ws_2'));
  });

  it('workspace and projects tags are distinct for the same id', () => {
    const id = 'ws_same';
    expect(tags.workspace(id)).not.toBe(tags.projects(id));
  });
});
