import { defineBlock, text, richText, reference } from '@verevoir/schema';

export const highlight = defineBlock({
  name: 'highlight',
  fields: {
    title: text('Title').max(200),
    description: richText('Description'),
    imageId: reference('Image', 'asset'),
    year: text('Year'),
    stat: text('Stat').optional(),
  },
});
