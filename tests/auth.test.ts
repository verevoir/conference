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

  // access 2.0.0 changed the test adapter's default for unknown tokens from
  // 'anonymous' to 'null', so it matches the Google / Apple / OIDC adapters:
  // an invalid token is an invalid token. The old default made it easy to
  // leave a route anonymously accessible if AUTH_MODE=test ever reached a
  // non-local environment.
  //
  // Nothing downstream regressed: UserContext falls back to ANONYMOUS when it
  // has no identity, so an anonymous visitor still gets the viewer role — it
  // now comes from the context layer rather than the auth adapter.
  it('returns null for a missing token', async () => {
    expect(await auth.resolve(null)).toBeNull();
  });

  it('returns null for an unknown token', async () => {
    expect(await auth.resolve('bogus')).toBeNull();
  });

  it('still resolves a known token to a non-anonymous identity', async () => {
    const identity = await auth.resolve('delegate-1-token');
    expect(identity).not.toBeNull();
    expect(isAnonymous(identity!)).toBe(false);
  });

  it('test accounts use google- prefixed IDs', () => {
    for (const account of testAccounts) {
      expect(account.identity.id).toMatch(/^google-/);
    }
  });
});
