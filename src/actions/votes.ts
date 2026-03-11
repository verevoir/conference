'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireAuthenticated } from '@/server/require-authenticated';
import { requireOrganiser } from '@/server/require-organiser';
import { getPhase } from '@/server/phase';
import { logger } from '@/server/logger';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

/** Cast a vote for a proposal. Any authenticated user, voting phase only. */
export async function castVote(proposalId: string): Promise<void> {
  const identity = await requireAuthenticated(await getToken());
  const phase = await getPhase();

  if (phase !== 'voting') {
    throw new Error('Voting is only available during the voting phase');
  }

  const db = await ensureDb();

  // Check for existing vote
  const existing = await db.list('vote', {
    where: { proposalId, voterId: identity.id },
  });
  if (existing.length > 0) {
    return; // Idempotent — already voted
  }

  await db.create('vote', { proposalId, voterId: identity.id });

  logger.info('Vote cast', {
    action: 'castVote',
    proposalId,
    voterId: identity.id,
  });
}

/** Remove a vote. Own vote only, voting phase only. */
export async function removeVote(proposalId: string): Promise<void> {
  const identity = await requireAuthenticated(await getToken());
  const phase = await getPhase();

  if (phase !== 'voting') {
    throw new Error('Voting is only available during the voting phase');
  }

  const db = await ensureDb();
  const existing = await db.list('vote', {
    where: { proposalId, voterId: identity.id },
  });

  if (existing.length > 0) {
    await db.delete(existing[0].id);
    logger.info('Vote removed', {
      action: 'removeVote',
      proposalId,
      voterId: identity.id,
    });
  }
}

/** Get vote count for a proposal. */
export async function getVoteTally(proposalId: string): Promise<number> {
  const db = await ensureDb();
  const votes = await db.list('vote', { where: { proposalId } });
  return votes.length;
}

/** Get all proposals the current user has voted for. */
export async function getMyVotes(): Promise<string[]> {
  const identity = await requireAuthenticated(await getToken());
  const db = await ensureDb();
  const votes = await db.list('vote', { where: { voterId: identity.id } });
  return votes.map((v) => (v.data as { proposalId: string }).proposalId);
}

/** Get tallies for all proposals. Organiser only (or during/after voting). */
export async function listTallies(): Promise<
  Array<{ proposalId: string; votes: number }>
> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();
  const allVotes = await db.list('vote');

  const tallies = new Map<string, number>();
  for (const v of allVotes) {
    const pid = (v.data as { proposalId: string }).proposalId;
    tallies.set(pid, (tallies.get(pid) ?? 0) + 1);
  }

  return Array.from(tallies.entries())
    .map(([proposalId, votes]) => ({ proposalId, votes }))
    .sort((a, b) => b.votes - a.votes);
}
