import { defineBlock, text, number } from '@verevoir/schema';

export const feedback = defineBlock({
  name: 'feedback',
  fields: {
    talkId: text('Talk ID'),
    delegateId: text('Delegate ID'),
    rating: number('Rating').int().min(1).max(5),
    comment: text('Comment').optional(),
  },
});
