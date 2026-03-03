import { defineBlock, text, reference } from '@nextlake/schema';

export const scheduleSlot = defineBlock({
  name: 'schedule-slot',
  fields: {
    talkId: reference('Talk', 'talk'),
    startTime: text('Start Time'),
    endTime: text('End Time'),
    room: text('Room'),
  },
});
