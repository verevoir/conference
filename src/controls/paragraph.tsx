import { defineBlock, richText } from '@verevoir/schema';
import { markdownToHtml } from '@verevoir/editor';
import type { ContentControl } from './types';

const block = defineBlock({
  name: 'content-paragraph',
  fields: {
    body: richText('Body'),
  },
});

function Renderer({ data }: { data: { body: string } }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: markdownToHtml(data.body) }} />
  );
}

export const paragraph: ContentControl = {
  type: 'paragraph',
  label: 'Text',
  block,
  Renderer,
};
