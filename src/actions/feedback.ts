'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { auth } from '@/server/auth';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { requireOrganiser } from '@/server/require-organiser';
import { logger } from '@/server/logger';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

async function requireDelegate(): Promise<string> {
  const token = await getToken();
  const identity = await auth.resolve(token);
  if (!identity) throw new Error('Unauthorized');
  return identity.id;
}

export async function submitFeedback(
  talkId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  try {
    const delegateId = await requireDelegate();
    const db = await ensureDb();
    // Check if feedback already exists for this delegate+talk
    const existing = await db.list('feedback', {
      where: { talkId, delegateId },
    });
    if (existing.length > 0) {
      await db.update(existing[0].id, { talkId, delegateId, rating, comment });
    } else {
      await db.create('feedback', { talkId, delegateId, rating, comment });
    }
  } catch (err) {
    logger.error('Failed to submit feedback', {
      action: 'submitFeedback',
      talkId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function getFeedbackForTalk(
  talkId: string,
): Promise<SerializedDocument[]> {
  try {
    await requireOrganiser(await getToken());
    const db = await ensureDb();
    const docs = await db.list('feedback', { where: { talkId } });
    return serializeDocuments(docs);
  } catch (err) {
    logger.error('Failed to get feedback for talk', {
      action: 'getFeedbackForTalk',
      talkId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function getMyFeedback(
  talkId: string,
): Promise<SerializedDocument | null> {
  try {
    const delegateId = await requireDelegate();
    const db = await ensureDb();
    const docs = await db.list('feedback', {
      where: { talkId, delegateId },
    });
    if (docs.length === 0) return null;
    return {
      id: docs[0].id,
      blockType: docs[0].blockType,
      data: docs[0].data as Record<string, unknown>,
      createdAt: docs[0].createdAt.toISOString(),
      updatedAt: docs[0].updatedAt.toISOString(),
    };
  } catch (err) {
    logger.error('Failed to get feedback', {
      action: 'getMyFeedback',
      talkId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
