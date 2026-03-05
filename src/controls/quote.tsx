import { defineBlock, richText, text } from '@verevoir/schema';
import type { ContentControl } from './types';

const block = defineBlock({
  name: 'content-quote',
  fields: {
    body: richText('Quote'),
    attribution: text('Attribution').optional(),
  },
});

function Renderer({ data }: { data: { body: string; attribution?: string } }) {
  return (
    <blockquote>
      <p>{data.body}</p>
      {data.attribution && <cite>{data.attribution}</cite>}
    </blockquote>
  );
}

export const quote: ContentControl = {
  type: 'quote',
  label: 'Quote',
  block,
  Renderer,
};
