'use server';

import { getRoleStore } from '@/server/roles';

export async function listRoleAssignments() {
  const store = await getRoleStore();
  return store.listAssignments();
}

export async function setUserRoles(
  userId: string,
  roles: string[],
): Promise<void> {
  const store = await getRoleStore();
  await store.setRoles(userId, roles);
}
