'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireOrganiser } from '@/server/require-organiser';
import {
  serializeDocument,
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';
import type { ListOptions } from '@verevoir/storage';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

export async function listDocuments(
  blockType: string,
  options?: ListOptions,
): Promise<SerializedDocument[]> {
  try {
    const db = await ensureDb();
    const docs = await db.list(blockType, options);
    return serializeDocuments(docs);
  } catch (err) {
    logger.error('Failed to list documents', {
      action: 'listDocuments',
      blockType,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function getDocument(
  id: string,
): Promise<SerializedDocument | null> {
  try {
    const db = await ensureDb();
    const doc = await db.get(id);
    if (!doc) return null;
    return serializeDocument(doc);
  } catch (err) {
    logger.error('Failed to get document', {
      action: 'getDocument',
      documentId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function createDocument(
  blockType: string,
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  try {
    await requireOrganiser(await getToken());
    const db = await ensureDb();
    const doc = await db.create(blockType, data);
    logger.info('Document created', {
      action: 'createDocument',
      blockType,
      documentId: doc.id,
    });
    return serializeDocument(doc);
  } catch (err) {
    logger.error('Failed to create document', {
      action: 'createDocument',
      blockType,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function updateDocument(
  id: string,
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  try {
    await requireOrganiser(await getToken());
    const db = await ensureDb();
    const doc = await db.update(id, data);
    logger.info('Document updated', {
      action: 'updateDocument',
      documentId: doc.id,
      blockType: doc.blockType,
    });
    return serializeDocument(doc);
  } catch (err) {
    logger.error('Failed to update document', {
      action: 'updateDocument',
      documentId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    await requireOrganiser(await getToken());
    const db = await ensureDb();
    await db.delete(id);
    logger.info('Document deleted', {
      action: 'deleteDocument',
      documentId: id,
    });
  } catch (err) {
    logger.error('Failed to delete document', {
      action: 'deleteDocument',
      documentId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
