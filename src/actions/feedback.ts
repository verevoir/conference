'use server';

import { ensureDb } from '@/server/db';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';

export async function submitFeedback(
  talkId: string,
  delegateId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  try {
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
      delegateId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function getFeedbackForTalk(
  talkId: string,
): Promise<SerializedDocument[]> {
  try {
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
  delegateId: string,
): Promise<SerializedDocument | null> {
  try {
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
      delegateId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
