'use server';

import { ensureDb } from '@/server/db';
import {
  serializeDocument,
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import type { ListOptions } from '@verevoir/storage';

export async function listDocuments(
  blockType: string,
  options?: ListOptions,
): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list(blockType, options);
  return serializeDocuments(docs);
}

export async function getDocument(
  id: string,
): Promise<SerializedDocument | null> {
  const db = await ensureDb();
  const doc = await db.get(id);
  if (!doc) return null;
  return serializeDocument(doc);
}

export async function createDocument(
  blockType: string,
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  const db = await ensureDb();
  const doc = await db.create(blockType, data);
  return serializeDocument(doc);
}

export async function updateDocument(
  id: string,
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  const db = await ensureDb();
  const doc = await db.update(id, data);
  return serializeDocument(doc);
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await ensureDb();
  await db.delete(id);
}
