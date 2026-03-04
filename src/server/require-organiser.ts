import type { Identity } from '@verevoir/access';
import { auth } from '@/server/auth';

export async function requireOrganiser(
  token: string | null,
): Promise<Identity> {
  const identity = await auth.resolve(token);
  if (!identity || !identity.roles.includes('organiser')) {
    throw new Error('Unauthorized');
  }
  return identity;
}
