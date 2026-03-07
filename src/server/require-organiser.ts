import type { Identity } from '@verevoir/access';
import { auth } from '@/server/auth';
import { logger } from '@/server/logger';

export async function requireOrganiser(
  token: string | null,
): Promise<Identity> {
  let identity: Identity | null = null;
  try {
    identity = await auth.resolve(token);
  } catch (err) {
    logger.warn('Auth resolution failed', {
      action: 'requireOrganiser',
      error: err instanceof Error ? err.message : String(err),
    });
  }
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
