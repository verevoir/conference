'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { auth } from '@/server/auth';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
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

export async function addBookmark(talkId: string): Promise<void> {
  try {
    const delegateId = await requireDelegate();
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
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function removeBookmark(talkId: string): Promise<void> {
  try {
    const delegateId = await requireDelegate();
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
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function getMyBookmarks(): Promise<SerializedDocument[]> {
  try {
    const delegateId = await requireDelegate();
    const db = await ensureDb();
    const docs = await db.list('bookmark', { where: { delegateId } });
    return serializeDocuments(docs);
  } catch (err) {
    logger.error('Failed to get bookmarks', {
      action: 'getMyBookmarks',
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
