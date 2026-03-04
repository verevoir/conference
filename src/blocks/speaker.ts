import { defineBlock, text, richText, reference } from '@verevoir/schema';

export const speaker = defineBlock({
  name: 'speaker',
  fields: {
    name: text('Name').max(100),
    bio: richText('Bio').optional(),
    email: text('Email').regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    company: text('Company').optional(),
    jobTitle: text('Job Title').optional(),
    photoId: reference('Photo', 'asset'),
    website: text('Website').optional(),
  },
});
