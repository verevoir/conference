import {
  defineBlock,
  text,
  richText,
  select,
  reference,
} from '@nextlake/schema';

export const sponsor = defineBlock({
  name: 'sponsor',
  fields: {
    name: text('Name').max(100),
    tier: select('Tier', ['platinum', 'gold', 'silver', 'community']),
    logoId: reference('Logo', 'asset'),
    url: text('URL'),
    description: richText('Description').optional(),
  },
});
