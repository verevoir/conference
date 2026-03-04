import { describe, it, expect, vi } from 'vitest';
import type { Identity } from '@verevoir/access';

vi.mock('@/server/auth', () => ({
  auth: {
    resolve: vi.fn(),
  },
}));

import { auth } from '@/server/auth';
import { requireOrganiser } from '@/server/require-organiser';

const mockResolve = vi.mocked(auth.resolve);

const organiser: Identity = {
  id: 'google-114823947',
  roles: ['organiser'],
  metadata: { email: 'organiser@example.com' },
};

const delegate: Identity = {
  id: 'google-229384756',
  roles: ['delegate'],
  metadata: { email: 'delegate@example.com' },
};

describe('requireOrganiser', () => {
  it('returns identity for a valid organiser token', async () => {
    mockResolve.mockResolvedValue(organiser);
    const result = await requireOrganiser('organiser-token');
    expect(result).toEqual(organiser);
  });

  it('throws for a delegate token', async () => {
    mockResolve.mockResolvedValue(delegate);
    await expect(requireOrganiser('delegate-token')).rejects.toThrow(
      'Unauthorized',
    );
  });

  it('throws for a null token', async () => {
    mockResolve.mockResolvedValue(null);
    await expect(requireOrganiser(null)).rejects.toThrow('Unauthorized');
  });

  it('throws when resolve returns null (unknown token)', async () => {
    mockResolve.mockResolvedValue(null);
    await expect(requireOrganiser('bogus')).rejects.toThrow('Unauthorized');
  });
});
