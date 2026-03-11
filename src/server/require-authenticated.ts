import type { Identity } from '@verevoir/access';
import { auth } from './auth';
import { logger } from './logger';

/** Resolve token to an identity, throw if not authenticated. */
export async function requireAuthenticated(
  token: string | null,
): Promise<Identity> {
  let identity: Identity | null = null;
  try {
    identity = await auth.resolve(token);
  } catch (err) {
    logger.warn('Auth resolution failed', {
      action: 'requireAuthenticated',
      error: err instanceof Error ? err.message : String(err),
    });
  }
  if (!identity) {
    throw new Error('Unauthorized');
  }
  return identity;
}

/** Resolve token and require a specific role. */
export async function requireRole(
  token: string | null,
  role: string,
): Promise<Identity> {
  const identity = await requireAuthenticated(token);
  if (!identity.roles.includes(role)) {
    logger.warn('Insufficient role', {
      action: 'requireRole',
      requiredRole: role,
      actualRoles: identity.roles,
    });
    throw new Error('Unauthorized');
  }
  return identity;
}

/** Resolve token and require organiser or presenter role. */
export async function requirePresenterOrOrganiser(
  token: string | null,
): Promise<Identity> {
  const identity = await requireAuthenticated(token);
  if (
    !identity.roles.includes('organiser') &&
    !identity.roles.includes('presenter')
  ) {
    logger.warn('Insufficient role', {
      action: 'requirePresenterOrOrganiser',
      actualRoles: identity.roles,
    });
    throw new Error('Unauthorized');
  }
  return identity;
}
