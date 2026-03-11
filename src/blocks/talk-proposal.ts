import {
  defineBlock,
  text,
  richText,
  reference,
  number,
  select,
} from '@verevoir/schema';

export const talkProposal = defineBlock({
  name: 'talk-proposal',
  fields: {
    title: text('Title').max(200),
    abstract: richText('Abstract').hint(
      'Clear and concise. State the problem, the approach, and what attendees will learn. 2-4 paragraphs.',
    ),
    speakerId: reference('Speaker', 'speaker'),
    trackId: reference('Track', 'track'),
    duration: number('Duration (minutes)').min(5).max(120).int(),
    level: select('Level', ['beginner', 'intermediate', 'advanced']),
    status: select('Status', [
      'draft',
      'submitted',
      'flagged',
      'accepted',
      'rejected',
      'changes-requested',
    ]).default('draft'),
    llmPrecis: text('Précis').optional(),
    llmFlags: text('Flags').optional(),
    submittedAt: text('Submitted At').optional(),
    createdBy: text('Created By').optional(),
  },
});
