import { AssetManager } from '@verevoir/assets';
import { ensureDb } from './db';
import { blobStore } from './blob-store';
import { getLlmClient } from './llm';
import { createAssetAnalyzer } from './asset-analyzer';

let manager: AssetManager | null = null;

export async function getAssetManager() {
  if (!manager) {
    const storage = await ensureDb();
    const llm = getLlmClient();
    manager = new AssetManager({
      storage,
      blobStore,
      analyzer: llm ? createAssetAnalyzer(llm) : undefined,
    });
  }
  return manager;
}
