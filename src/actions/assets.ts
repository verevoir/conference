'use server';

import { cookies } from 'next/headers';
import { getAssetManager } from '@/server/asset-manager';
import { blobStore } from '@/server/blob-store';
import {
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { ensureDb } from '@/server/db';
import { requireOrganiser } from '@/server/require-organiser';
import { logger } from '@/server/logger';
import type { ListOptions } from '@verevoir/storage';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

export async function listAssets(
  options?: ListOptions,
): Promise<SerializedDocument[]> {
  try {
    const db = await ensureDb();
    const docs = await db.list('asset', options);
    return serializeDocuments(docs);
  } catch (err) {
    logger.error('Failed to list assets', {
      action: 'listAssets',
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function uploadAsset(formData: FormData): Promise<string> {
  await requireOrganiser(await getToken());
  const file = formData.get('file') as File;
  const createdBy = formData.get('createdBy') as string;
  if (!file) throw new Error('No file provided');

  try {
    const manager = await getAssetManager();
    const buffer = new Uint8Array(await file.arrayBuffer());
    const asset = await manager.upload({
      data: buffer,
      filename: file.name,
      contentType: file.type,
      createdBy: createdBy || 'unknown',
    });
    logger.info('Asset uploaded', {
      action: 'uploadAsset',
      assetId: asset.id,
      filename: file.name,
      contentType: file.type,
    });
    return asset.id;
  } catch (err) {
    logger.error('Failed to upload asset', {
      action: 'uploadAsset',
      filename: file.name,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function deleteAsset(id: string): Promise<void> {
  try {
    await requireOrganiser(await getToken());
    const manager = await getAssetManager();
    await manager.delete(id);
    logger.info('Asset deleted', { action: 'deleteAsset', assetId: id });
  } catch (err) {
    logger.error('Failed to delete asset', {
      action: 'deleteAsset',
      assetId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function updateAssetHotspot(
  id: string,
  hotspot: { x: number; y: number } | null,
): Promise<void> {
  try {
    await requireOrganiser(await getToken());
    const manager = await getAssetManager();
    await manager.updateMetadata(id, { hotspot });
  } catch (err) {
    logger.error('Failed to update asset hotspot', {
      action: 'updateAssetHotspot',
      assetId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function updateAssetTags(
  id: string,
  tags: string[],
): Promise<void> {
  try {
    await requireOrganiser(await getToken());
    const manager = await getAssetManager();
    await manager.updateMetadata(id, { tags });
  } catch (err) {
    logger.error('Failed to update asset tags', {
      action: 'updateAssetTags',
      assetId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function updateAssetAlt(
  id: string,
  alt: string | null,
): Promise<void> {
  try {
    await requireOrganiser(await getToken());
    const manager = await getAssetManager();
    await manager.updateMetadata(id, { alt });
  } catch (err) {
    logger.error('Failed to update asset alt', {
      action: 'updateAssetAlt',
      assetId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function updateAssetAttribution(
  id: string,
  attribution: string | null,
): Promise<void> {
  try {
    await requireOrganiser(await getToken());
    const manager = await getAssetManager();
    await manager.updateMetadata(id, { attribution });
  } catch (err) {
    logger.error('Failed to update asset attribution', {
      action: 'updateAssetAttribution',
      assetId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
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
  } catch (err) {
    logger.error('Failed to get blob data', {
      action: 'getBlobData',
      blobKey,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
