import { Storage } from '@google-cloud/storage';
import { GcsBlobStore } from '@nextlake/assets/gcs';

const client = new Storage();

export const blobStore = new GcsBlobStore({
  client,
  bucket: process.env.GCS_BUCKET!,
  prefix: process.env.GCS_PREFIX ?? 'assets/',
});
