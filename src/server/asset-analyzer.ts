import type {
  AssetAnalyzer,
  AnalyzerInput,
  AnalyzerResult,
} from '@verevoir/assets';
import type Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';

export function createAssetAnalyzer(client: Anthropic): AssetAnalyzer {
  return {
    async analyze(input: AnalyzerInput): Promise<AnalyzerResult> {
      const [mimePrefix] = input.contentType.split('/');
      if (mimePrefix !== 'image') {
        return { alt: '', tags: [] };
      }

      const existingTagsHint =
        input.existingTags && input.existingTags.length > 0
          ? `\n\nExisting tags in the system: ${input.existingTags.join(', ')}. Prefer reusing these when appropriate, but add new ones if needed.`
          : '';

      let response;
      try {
        response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: input.contentType as
                      | 'image/jpeg'
                      | 'image/png'
                      | 'image/gif'
                      | 'image/webp',
                    data: Buffer.from(input.data).toString('base64'),
                  },
                },
                {
                  type: 'text',
                  text: `Analyze this image (filename: ${input.filename}) and return a JSON object with:
- "alt": a concise, descriptive alt text for accessibility (1-2 sentences)
- "tags": an array of 3-8 lowercase tags describing the content, style, and subject matter${existingTagsHint}

Return ONLY the JSON object, no other text.`,
                },
              ],
            },
          ],
        });
      } catch (apiErr) {
        logger.error('Asset analyzer API call failed', {
          filename: input.filename,
          error: apiErr instanceof Error ? apiErr.message : String(apiErr),
          stack: apiErr instanceof Error ? apiErr.stack : undefined,
        });
        throw apiErr;
      }

      const raw =
        response.content[0].type === 'text' ? response.content[0].text : '';
      // Strip markdown code fences if present
      const text = raw
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '');

      let parsed: { alt?: unknown; tags?: unknown };
      try {
        parsed = JSON.parse(text);
      } catch {
        logger.warn('Asset analyzer returned invalid JSON', {
          filename: input.filename,
          response: text,
        });
        return { alt: '', tags: [] };
      }

      logger.info('Asset analyzed', {
        filename: input.filename,
        alt: parsed.alt,
        tags: parsed.tags,
      });

      return {
        alt: String(parsed.alt || ''),
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.map((t: unknown) => String(t).toLowerCase())
          : [],
      };
    },
  };
}
