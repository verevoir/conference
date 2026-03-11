import { defineBlock, text } from '@verevoir/schema';

export const vote = defineBlock({
  name: 'vote',
  fields: {
    proposalId: text('Proposal ID'),
    voterId: text('Voter ID'),
  },
});
