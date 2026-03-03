import { defineBlock, text, richText } from '@nextlake/schema';

export const track = defineBlock({
  name: 'track',
  fields: {
    name: text('Name').max(100),
    description: richText('Description').optional(),
    color: text('Color'),
  },
});
