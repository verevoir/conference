import { ensureDb } from './db';
import type { ConferencePhase } from '@/blocks/config';

/** Read the current conference phase from the config singleton. Defaults to 'setup'. */
export async function getPhase(): Promise<ConferencePhase> {
  const db = await ensureDb();
  const configs = await db.list('config', { limit: 1 });
  if (configs.length === 0) return 'setup';
  return (
    ((configs[0].data as { phase?: string }).phase as ConferencePhase) ||
    'setup'
  );
}
