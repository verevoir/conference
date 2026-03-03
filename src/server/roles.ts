import { createRoleStore } from '@nextlake/access/role-store';
import { ensureDb } from './db';

type RoleStore = Awaited<ReturnType<typeof createRoleStore>>;

let roleStore: RoleStore | null = null;

export async function getRoleStore() {
  if (!roleStore) {
    const storage = await ensureDb();
    roleStore = createRoleStore({
      storage,
      seedAdmin: {
        userId: process.env.SEED_ADMIN_ID ?? 'google-114823947',
        roles: ['organiser'],
      },
    });
  }
  return roleStore;
}
