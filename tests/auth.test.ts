import { describe, it, expect } from 'vitest';
import { isAnonymous } from '@verevoir/access';
import { auth, testAccounts } from '@/server/auth';

describe('test auth adapter', () => {
  it('resolves organiser token to identity with organiser role', async () => {
    const identity = await auth.resolve('organiser-token');
    expect(identity).not.toBeNull();
    expect(identity!.roles).toEqual(['organiser']);
    expect(identity!.id).toBe('google-114823947');
  });

  it('resolves delegate token to identity with delegate role', async () => {
    const identity = await auth.resolve('delegate-1-token');
    expect(identity).not.toBeNull();
    expect(identity!.roles).toEqual(['delegate']);
    expect(identity!.id).toBe('google-229384756');
  });

  it('returns ANONYMOUS for null token', async () => {
    const identity = await auth.resolve(null);
    expect(identity).not.toBeNull();
    expect(isAnonymous(identity!)).toBe(true);
  });

  it('returns ANONYMOUS for unknown token', async () => {
    const identity = await auth.resolve('bogus');
    expect(identity).not.toBeNull();
    expect(isAnonymous(identity!)).toBe(true);
  });

  it('test accounts use google- prefixed IDs', () => {
    for (const account of testAccounts) {
      expect(account.identity.id).toMatch(/^google-/);
    }
  });
});
