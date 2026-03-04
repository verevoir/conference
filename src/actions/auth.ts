'use server';

import { auth, testAccounts } from '@/server/auth';
import { logger } from '@/server/logger';
import type { Identity } from '@verevoir/access';

export async function resolveToken(
  token: string | null,
): Promise<Identity | null> {
  try {
    return await auth.resolve(token);
  } catch (err) {
    logger.error('Failed to resolve auth token', {
      action: 'resolveToken',
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
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
