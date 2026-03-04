'use server';

import { getRoleStore } from '@/server/roles';
import { logger } from '@/server/logger';

export async function listRoleAssignments() {
  try {
    const store = await getRoleStore();
    return store.listAssignments();
  } catch (err) {
    logger.error('Failed to list role assignments', {
      action: 'listRoleAssignments',
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function setUserRoles(
  userId: string,
  roles: string[],
): Promise<void> {
  try {
    const store = await getRoleStore();
    await store.setRoles(userId, roles);
    logger.info('User roles updated', {
      action: 'setUserRoles',
      userId,
      roles,
    });
  } catch (err) {
    logger.error('Failed to set user roles', {
      action: 'setUserRoles',
      userId,
      roles,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
