import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Identity } from '@verevoir/access';

vi.mock('@/server/auth', () => ({
  auth: {
    resolve: vi.fn(),
  },
}));

vi.mock('@/server/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { auth } from '@/server/auth';
import { logger } from '@/server/logger';
import { resolveToken } from '@/actions/auth';

const mockResolve = vi.mocked(auth.resolve);
const mockLogError = vi.mocked(logger.error);

const organiser: Identity = {
  id: 'google-114823947',
  roles: ['organiser'],
  metadata: { email: 'organiser@example.com' },
};

describe('resolveToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns identity when auth.resolve succeeds', async () => {
    mockResolve.mockResolvedValue(organiser);
    const result = await resolveToken('valid-token');
    expect(result).toEqual(organiser);
  });

  it('returns null when auth.resolve returns null', async () => {
    mockResolve.mockResolvedValue(null);
    const result = await resolveToken(null);
    expect(result).toBeNull();
  });

  it('returns null when auth.resolve throws (infra error)', async () => {
    mockResolve.mockRejectedValue(new Error('ECONNREFUSED'));
    const result = await resolveToken('any-token');
    expect(result).toBeNull();
  });

  it('logs the error when auth.resolve throws', async () => {
    mockResolve.mockRejectedValue(new Error('ECONNREFUSED'));
    await resolveToken('any-token');
    expect(mockLogError).toHaveBeenCalledWith(
      'Failed to resolve auth token',
      expect.objectContaining({
        action: 'resolveToken',
        error: 'ECONNREFUSED',
      }),
    );
  });
});
