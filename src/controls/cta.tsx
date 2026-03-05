import { defineBlock, text } from '@verevoir/schema';
import type { ContentControl } from './types';

const block = defineBlock({
  name: 'content-cta',
  fields: {
    label: text('Button Label'),
    url: text('URL'),
  },
});

function Renderer({ data }: { data: { label: string; url: string } }) {
  return (
    <div>
      <a href={data.url} role="button">
        {data.label}
      </a>
    </div>
  );
}

export const cta: ContentControl = {
  type: 'cta',
  label: 'Call to Action',
  block,
  Renderer,
};
