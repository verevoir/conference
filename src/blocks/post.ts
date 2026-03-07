import {
  defineBlock,
  text,
  richText,
  select,
  reference,
} from '@verevoir/schema';

export const post = defineBlock({
  name: 'post',
  fields: {
    title: text('Title').max(200),
    body: richText('Body').hint(
      'Blog post for conference delegates. Use subheadings, short paragraphs, and a conversational tone.',
    ),
    slug: text('Slug'),
    authorId: reference('Author', 'speaker'),
    heroImageId: reference('Hero Image', 'asset'),
    status: select('Status', ['draft', 'review', 'published', 'archived']),
  },
});
