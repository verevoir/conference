import { defineBlock, text, richText, reference } from '@verevoir/schema';

export const organiser = defineBlock({
  name: 'organiser',
  fields: {
    name: text('Name').max(100),
    role: text('Role').max(100),
    bio: richText('Bio'),
    photoId: reference('Photo', 'asset'),
    passions: text('Passions').optional(),
  },
});
