import { defineBlock, text, richText, reference } from '@verevoir/schema';

export const page = defineBlock({
  name: 'page',
  fields: {
    title: text('Title').max(200),
    slug: text('Slug'),
    body: richText('Body'),
    heroImageId: reference('Hero Image', 'asset'),
  },
});
