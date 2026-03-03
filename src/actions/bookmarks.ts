'use server';

import { ensureDb } from '@/server/db';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';

export async function addBookmark(
  talkId: string,
  delegateId: string,
): Promise<void> {
  const db = await ensureDb();
  const existing = await db.list('bookmark', {
    where: { talkId, delegateId },
  });
  if (existing.length === 0) {
    await db.create('bookmark', { talkId, delegateId });
  }
}

export async function removeBookmark(
  talkId: string,
  delegateId: string,
): Promise<void> {
  const db = await ensureDb();
  const existing = await db.list('bookmark', {
    where: { talkId, delegateId },
  });
  if (existing.length > 0) {
    await db.delete(existing[0].id);
  }
}

export async function getMyBookmarks(
  delegateId: string,
): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list('bookmark', { where: { delegateId } });
  return serializeDocuments(docs);
}
