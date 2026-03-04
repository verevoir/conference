import { PostgresAdapter } from '@verevoir/storage';
import { logger } from '@/server/logger';

const storage = new PostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
});

let initialized = false;

export async function ensureDb() {
  if (!initialized) {
    logger.info('Database connecting');
    await storage.connect();
    logger.info('Database migrating');
    await storage.migrate();
    initialized = true;
    logger.info('Database ready');
  }
  return storage;
}
