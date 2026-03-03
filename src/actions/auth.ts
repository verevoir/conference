'use server';

import { auth, testAccounts } from '@/server/auth';
import type { Identity } from '@nextlake/access';

export async function resolveToken(
  token: string | null,
): Promise<Identity | null> {
  return auth.resolve(token);
}

export async function getTestAccounts() {
  if (process.env.AUTH_MODE !== 'test') return [];
  return testAccounts.map((a) => ({
    token: a.token,
    name: a.identity.metadata?.name as string,
    email: a.identity.metadata?.email as string,
    roles: a.identity.roles,
  }));
}

export async function getAuthMode(): Promise<string> {
  return process.env.AUTH_MODE ?? 'google';
}
