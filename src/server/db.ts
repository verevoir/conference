import { PostgresAdapter } from '@nextlake/storage';

const storage = new PostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
});

let initialized = false;

export async function ensureDb() {
  if (!initialized) {
    await storage.connect();
    await storage.migrate();
    initialized = true;
  }
  return storage;
}
