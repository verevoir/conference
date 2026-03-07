import {
  defineBlock,
  text,
  richText,
  number,
  select,
  reference,
} from '@verevoir/schema';

export const talk = defineBlock({
  name: 'talk',
  fields: {
    title: text('Title').max(200),
    abstract: richText('Abstract').hint(
      'Technical summary for conference delegates. Highlight key takeaways and what attendees will learn. 2-3 paragraphs.',
    ),
    speakerId: reference('Speaker', 'speaker'),
    trackId: reference('Track', 'track'),
    duration: number('Duration (mins)').int().min(5).max(120),
    level: select('Level', ['beginner', 'intermediate', 'advanced']),
    status: select('Status', ['draft', 'published']),
  },
});
