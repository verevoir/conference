'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireOrganiser } from '@/server/require-organiser';
import { getPhase } from '@/server/phase';
import { conferenceLifecycle } from '@/access/workflow';
import {
  serializeDocument,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';
import type { ConferencePhase } from '@/blocks/config';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

/** Get the current conference phase. */
export async function getConferencePhase(): Promise<ConferencePhase> {
  return getPhase();
}

/** Get the config document. */
export async function getConfig(): Promise<SerializedDocument | null> {
  const db = await ensureDb();
  const configs = await db.list('config', { limit: 1 });
  if (configs.length === 0) return null;
  return serializeDocument(configs[0]);
}

/** Advance the conference to the next phase. Organiser only. */
export async function advancePhase(): Promise<ConferencePhase> {
  const identity = await requireOrganiser(await getToken());
  const db = await ensureDb();
  const configs = await db.list('config', { limit: 1 });
  if (configs.length === 0) {
    throw new Error('No config found. Create conference config first.');
  }

  const configDoc = configs[0];
  const currentPhase =
    ((configDoc.data as { phase?: string }).phase as ConferencePhase) ||
    'setup';

  const transitions = conferenceLifecycle.availableTransitions(
    currentPhase,
    identity,
  );
  if (transitions.length === 0) {
    throw new Error(`No transition available from phase: ${currentPhase}`);
  }

  const nextPhase = transitions[0].to as ConferencePhase;
  await db.update(configDoc.id, { ...configDoc.data, phase: nextPhase });

  logger.info('Conference phase advanced', {
    action: 'advancePhase',
    from: currentPhase,
    to: nextPhase,
  });

  return nextPhase;
}
