import { defineBlock, text, boolean } from '@nextlake/schema';

export const config = defineBlock({
  name: 'config',
  fields: {
    conferenceName: text('Conference Name'),
    tagline: text('Tagline').optional(),
    date: text('Date'),
    venue: text('Venue'),
    feedbackOpen: boolean('Feedback Open').default(false),
  },
});
