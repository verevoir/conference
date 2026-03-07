import { defineBlock, richText, text } from '@verevoir/schema';
import { markdownToHtml } from '@verevoir/editor';
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
      <div dangerouslySetInnerHTML={{ __html: markdownToHtml(data.body) }} />
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
