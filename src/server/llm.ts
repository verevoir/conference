import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';

let client: Anthropic | null = null;
let checked = false;

/** Returns the shared Anthropic client, or null if ANTHROPIC_API_KEY is not set. */
export function getLlmClient(): Anthropic | null {
  if (!checked) {
    checked = true;
    if (process.env.ANTHROPIC_API_KEY) {
      client = new Anthropic();
      logger.info('LLM client initialized');
    } else {
      logger.info('LLM client disabled (no ANTHROPIC_API_KEY)');
    }
  }
  return client;
}
