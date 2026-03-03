import { createTestAuthAdapter } from '@nextlake/access/test-accounts';
import type { TestAccount } from '@nextlake/access/test-accounts';
import type { Identity } from '@nextlake/access';

const testAccounts: TestAccount[] = [
  {
    token: 'organiser-token',
    identity: {
      id: 'google-114823947',
      roles: ['organiser'],
      metadata: { email: 'organiser@example.com', name: 'Alice Organiser' },
    },
  },
  {
    token: 'delegate-1-token',
    identity: {
      id: 'google-229384756',
      roles: ['delegate'],
      metadata: { email: 'delegate1@example.com', name: 'Bob Delegate' },
    },
  },
  {
    token: 'delegate-2-token',
    identity: {
      id: 'google-335847291',
      roles: ['delegate'],
      metadata: { email: 'delegate2@example.com', name: 'Carol Delegate' },
    },
  },
];

function createAuth() {
  if (process.env.AUTH_MODE === 'test') {
    return createTestAuthAdapter({ accounts: testAccounts });
  }

  // Production: Google OAuth
  // Lazy-import to avoid loading google-auth-library in test mode
  const adapter = {
    async resolve(token: string | null): Promise<Identity | null> {
      if (!token) return null;
      const { createGoogleAuthAdapter } =
        await import('@nextlake/access/google');
      const { getRoleStore } = await import('./roles');
      const roleStore = await getRoleStore();
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
      const googleAuth = createGoogleAuthAdapter({
        // Cast needed: google-auth-library types across package boundaries
        // are structurally compatible but TypeScript can't verify across versions
        client: client as unknown as Parameters<
          typeof createGoogleAuthAdapter
        >[0]['client'],
        allowedClientIds: [process.env.GOOGLE_CLIENT_ID!],
        hostedDomain: process.env.GOOGLE_HOSTED_DOMAIN || undefined,
        mapRoles: async (payload) => {
          const sub = payload.sub ?? '';
          const roles = await roleStore.getRoles(sub);
          return roles.length > 0 ? roles : ['delegate'];
        },
      });
      return googleAuth.resolve(token);
    },
  };
  return adapter;
}

export const auth = createAuth();
export { testAccounts };
