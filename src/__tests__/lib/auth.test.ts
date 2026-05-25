import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '@/lib/auth';
import type { SessionUser }       from '@/types';

const SAMPLE_USER: SessionUser = {
  userId:      'user_123',
  workspaceId: 'ws_456',
  email:       'alice@acme.com',
  name:        'Alice Chen',
  role:        'OWNER',
};

// ── signToken + verifyToken ───────────────────────────────────────────────────

describe('signToken / verifyToken', () => {
  it('creates a token that can be verified', async () => {
    const token  = await signToken(SAMPLE_USER);
    const result = await verifyToken(token);

    expect(result).not.toBeNull();
    expect(result?.userId).toBe(SAMPLE_USER.userId);
    expect(result?.workspaceId).toBe(SAMPLE_USER.workspaceId);
    expect(result?.email).toBe(SAMPLE_USER.email);
    expect(result?.name).toBe(SAMPLE_USER.name);
    expect(result?.role).toBe(SAMPLE_USER.role);
  });

  it('token is a three-part JWT string', async () => {
    const token  = await signToken(SAMPLE_USER);
    const parts  = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('returns null for a tampered token', async () => {
    const token   = await signToken(SAMPLE_USER);
    const tampered = token.slice(0, -4) + 'xxxx'; // corrupt the signature
    const result  = await verifyToken(tampered);
    expect(result).toBeNull();
  });

  it('returns null for a completely invalid string', async () => {
    const result = await verifyToken('not.a.token');
    expect(result).toBeNull();
  });

  it('returns null for an empty string', async () => {
    const result = await verifyToken('');
    expect(result).toBeNull();
  });

  it('different users produce different tokens', async () => {
    const user2: SessionUser = { ...SAMPLE_USER, userId: 'user_999', email: 'bob@acme.com' };
    const t1 = await signToken(SAMPLE_USER);
    const t2 = await signToken(user2);
    expect(t1).not.toBe(t2);
  });
});
