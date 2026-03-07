import { defineBlock, text, number } from '@verevoir/schema';
import { publishFields } from '@verevoir/editor';

export const page = defineBlock({
  name: 'page',
  fields: {
    title: text('Title').max(200),
    slug: text('Slug'),
    ...publishFields(),
    version: number('Version').int().default(1),
  },
});
