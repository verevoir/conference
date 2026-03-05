import { defineBlock, text, select, number } from '@verevoir/schema';

export const page = defineBlock({
  name: 'page',
  fields: {
    title: text('Title').max(200),
    slug: text('Slug'),
    status: select('Status', ['draft', 'published', 'archived']).default(
      'draft',
    ),
    version: number('Version').int().default(1),
  },
});
