'use server';

import { ensureDb } from '@/server/db';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';

export async function addBookmark(
  talkId: string,
  delegateId: string,
): Promise<void> {
  try {
    const db = await ensureDb();
    const existing = await db.list('bookmark', {
      where: { talkId, delegateId },
    });
    if (existing.length === 0) {
      await db.create('bookmark', { talkId, delegateId });
    }
  } catch (err) {
    logger.error('Failed to add bookmark', {
      action: 'addBookmark',
      talkId,
      delegateId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function removeBookmark(
  talkId: string,
  delegateId: string,
): Promise<void> {
  try {
    const db = await ensureDb();
    const existing = await db.list('bookmark', {
      where: { talkId, delegateId },
    });
    if (existing.length > 0) {
      await db.delete(existing[0].id);
    }
  } catch (err) {
    logger.error('Failed to remove bookmark', {
      action: 'removeBookmark',
      talkId,
      delegateId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function getMyBookmarks(
  delegateId: string,
): Promise<SerializedDocument[]> {
  try {
    const db = await ensureDb();
    const docs = await db.list('bookmark', { where: { delegateId } });
    return serializeDocuments(docs);
  } catch (err) {
    logger.error('Failed to get bookmarks', {
      action: 'getMyBookmarks',
      delegateId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
