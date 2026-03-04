'use server';

import { getAssetManager } from '@/server/asset-manager';
import { blobStore } from '@/server/blob-store';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { ensureDb } from '@/server/db';
import type { ListOptions } from '@verevoir/storage';

export async function listAssets(
  options?: ListOptions,
): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list('asset', options);
  return serializeDocuments(docs);
}

export async function uploadAsset(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  const createdBy = formData.get('createdBy') as string;
  if (!file) throw new Error('No file provided');

  const manager = await getAssetManager();
  const buffer = new Uint8Array(await file.arrayBuffer());
  const asset = await manager.upload({
    data: buffer,
    filename: file.name,
    contentType: file.type,
    createdBy: createdBy || 'unknown',
  });
  return asset.id;
}

export async function deleteAsset(id: string): Promise<void> {
  const manager = await getAssetManager();
  await manager.delete(id);
}

export async function updateAssetHotspot(
  id: string,
  hotspot: { x: number; y: number } | null,
): Promise<void> {
  const manager = await getAssetManager();
  await manager.updateMetadata(id, { hotspot });
}

export async function getAssetBlobUrl(blobKey: string): Promise<string> {
  // Serve blobs via the API route
  return `/api/blobs/${encodeURIComponent(blobKey)}`;
}

// Re-export for use in blob API route
export async function getBlobData(blobKey: string): Promise<Uint8Array | null> {
  try {
    const result = await blobStore.get(blobKey);
    if (!result) return null;
    return result.data;
  } catch {
    return null;
  }
}
