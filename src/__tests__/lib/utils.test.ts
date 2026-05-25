import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { timeAgo, slugify, formatDuration } from '@/lib/utils';

// ── timeAgo ───────────────────────────────────────────────────────────────────

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('returns "just now" for times less than 1 minute ago', () => {
    const date = new Date('2025-01-15T11:59:30Z');
    expect(timeAgo(date)).toBe('just now');
  });

  it('returns minutes for recent times', () => {
    expect(timeAgo(new Date('2025-01-15T11:45:00Z'))).toBe('15m ago');
    expect(timeAgo(new Date('2025-01-15T11:59:00Z'))).toBe('1m ago');
  });

  it('returns hours for same-day times', () => {
    expect(timeAgo(new Date('2025-01-15T09:00:00Z'))).toBe('3h ago');
    expect(timeAgo(new Date('2025-01-15T11:00:00Z'))).toBe('1h ago');
  });

  it('returns days for older times', () => {
    expect(timeAgo(new Date('2025-01-14T12:00:00Z'))).toBe('1d ago');
    expect(timeAgo(new Date('2025-01-12T12:00:00Z'))).toBe('3d ago');
  });

  it('accepts ISO string as well as Date object', () => {
    const result = timeAgo('2025-01-15T11:59:30Z');
    expect(result).toBe('just now');
  });
});

// ── slugify ───────────────────────────────────────────────────────────────────

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Acme Engineering')).toBe('acme-engineering');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Foo & Bar! (Inc.)')).toBe('foo-bar-inc');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(slugify('foo   ---   bar')).toBe('foo-bar');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  --hello--  ')).toBe('hello');
  });

  it('truncates to 40 characters', () => {
    const long   = 'a'.repeat(50);
    const result = slugify(long);
    expect(result.length).toBeLessThanOrEqual(40);
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

// ── formatDuration ────────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('returns "—" for null', () => {
    expect(formatDuration(null)).toBe('—');
  });

  it('formats seconds under a minute', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(125)).toBe('2m 5s');
  });
});
