'use server';

import { ensureDb } from '@/server/db';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';

export async function submitFeedback(
  talkId: string,
  delegateId: string,
  rating: number,
  comment?: string,
): Promise<void> {
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
}

export async function getFeedbackForTalk(
  talkId: string,
): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list('feedback', { where: { talkId } });
  return serializeDocuments(docs);
}

export async function getMyFeedback(
  talkId: string,
  delegateId: string,
): Promise<SerializedDocument | null> {
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
}
