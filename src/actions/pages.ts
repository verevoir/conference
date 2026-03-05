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

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

/** Publish a draft page version. Archives the current published version (if any) for that slug. */
export async function publishPage(id: string): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();

  const doc = await db.get(id);
  if (!doc) throw new Error(`Page not found: ${id}`);

  const slug = doc.data.slug as string;

  // Archive the currently published version for this slug
  const allVersions = await db.list('page', { where: { slug } });
  for (const v of allVersions) {
    if (v.data.status === 'published' && v.id !== id) {
      await db.update(v.id, { ...v.data, status: 'archived' });
    }
  }

  // Publish this version
  const updated = await db.update(id, { ...doc.data, status: 'published' });
  logger.info('Page published', {
    action: 'publishPage',
    documentId: id,
    slug,
    version: doc.data.version,
  });
  return serializeDocument(updated);
}

/** Unpublish a page — revert to draft. */
export async function unpublishPage(id: string): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();

  const doc = await db.get(id);
  if (!doc) throw new Error(`Page not found: ${id}`);

  const updated = await db.update(id, { ...doc.data, status: 'draft' });
  logger.info('Page unpublished', {
    action: 'unpublishPage',
    documentId: id,
  });
  return serializeDocument(updated);
}

/** Create a new draft version from an existing page. Copies content, increments version. */
export async function createNewVersion(
  sourceId: string,
): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();

  const source = await db.get(sourceId);
  if (!source) throw new Error(`Page not found: ${sourceId}`);

  const slug = source.data.slug as string;

  // Find the highest version number for this slug
  const allVersions = await db.list('page', { where: { slug } });
  const maxVersion = Math.max(
    ...allVersions.map((v) => (v.data.version as number) || 1),
  );

  const newDoc = await db.create('page', {
    ...source.data,
    status: 'draft',
    version: maxVersion + 1,
  });

  logger.info('New page version created', {
    action: 'createNewVersion',
    sourceId,
    newId: newDoc.id,
    slug,
    version: maxVersion + 1,
  });
  return serializeDocument(newDoc);
}

/** List all versions of a page by slug. */
export async function listPageVersions(
  slug: string,
): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list('page', { where: { slug } });
  docs.sort(
    (a, b) =>
      ((b.data.version as number) || 1) - ((a.data.version as number) || 1),
  );
  return serializeDocuments(docs);
}
