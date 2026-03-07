'use server';

import { cookies } from 'next/headers';
import { getLlmClient } from '@/server/llm';
import { requireOrganiser } from '@/server/require-organiser';
import { logger } from '@/server/logger';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

interface CopyAssistInput {
  fieldName: string;
  fieldLabel: string;
  hint?: string;
  currentValue: string;
  context: Record<string, unknown>;
}

const VOICE = `You are writing copy for a professional technology conference website.
Tone: confident, approachable, and concise. Avoid jargon unless the audience is technical.
Write for the web — short paragraphs, scannable text, active voice.`;

/**
 * Generate suggested copy for a rich text field using the LLM.
 * Returns markdown-formatted text.
 */
export async function generateCopy(input: CopyAssistInput): Promise<string> {
  await requireOrganiser(await getToken());
  const client = getLlmClient();
  if (!client) {
    throw new Error('LLM not configured (no ANTHROPIC_API_KEY)');
  }

  const contextLines = Object.entries(input.context)
    .filter(([k, v]) => k !== input.fieldName && v != null && v !== '')
    .map(([k, v]) => `${k}: ${String(v).slice(0, 200)}`)
    .join('\n');

  const parts: string[] = [
    VOICE,
    '',
    `You are writing the "${input.fieldLabel}" field.`,
  ];

  if (input.hint) {
    parts.push(`Directive: ${input.hint}`);
  }

  if (contextLines) {
    parts.push('', 'Context from other fields on this document:', contextLines);
  }

  if (input.currentValue) {
    parts.push(
      '',
      'The field currently contains:',
      input.currentValue,
      '',
      'Write an improved version. Keep the same meaning but improve clarity, tone, and structure.',
    );
  } else {
    parts.push('', 'The field is currently empty. Write initial content.');
  }

  parts.push(
    '',
    'Return ONLY the content in markdown format. No preamble, no explanation.',
  );

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: parts.join('\n') }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    logger.info('Copy generated', {
      action: 'generateCopy',
      fieldName: input.fieldName,
      fieldLabel: input.fieldLabel,
      hint: input.hint,
      length: text.length,
    });

    return text.trim();
  } catch (err) {
    logger.error('Copy generation failed', {
      action: 'generateCopy',
      fieldName: input.fieldName,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
