import { defineBlock, text } from '@verevoir/schema';

export const bookmark = defineBlock({
  name: 'bookmark',
  fields: {
    talkId: text('Talk ID'),
    delegateId: text('Delegate ID'),
  },
});
