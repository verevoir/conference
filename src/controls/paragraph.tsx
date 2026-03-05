import { defineBlock, richText } from '@verevoir/schema';
import type { ContentControl } from './types';

const block = defineBlock({
  name: 'content-paragraph',
  fields: {
    body: richText('Body'),
  },
});

function Renderer({ data }: { data: { body: string } }) {
  return <p>{data.body}</p>;
}

export const paragraph: ContentControl = {
  type: 'paragraph',
  label: 'Text',
  block,
  Renderer,
};
