import { AssetManager } from '@verevoir/assets';
import { ensureDb } from './db';
import { blobStore } from './blob-store';

let manager: AssetManager | null = null;

export async function getAssetManager() {
  if (!manager) {
    const storage = await ensureDb();
    manager = new AssetManager({ storage, blobStore });
  }
  return manager;
}
