import type { Identity } from '@verevoir/access';
import { auth } from '@/server/auth';
import { logger } from '@/server/logger';

export async function requireOrganiser(
  token: string | null,
): Promise<Identity> {
  const identity = await auth.resolve(token);
  if (!identity || !identity.roles.includes('organiser')) {
    logger.warn('Unauthorized access attempt', {
      action: 'requireOrganiser',
      hasIdentity: !!identity,
      roles: identity?.roles,
    });
    throw new Error('Unauthorized');
  }
  return identity;
}
