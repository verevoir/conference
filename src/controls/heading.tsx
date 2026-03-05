import { defineBlock, text, select } from '@verevoir/schema';
import type { ContentControl } from './types';

const block = defineBlock({
  name: 'content-heading',
  fields: {
    level: select('Level', ['h2', 'h3', 'h4']).default('h2'),
    text: text('Text'),
  },
});

function Renderer({ data }: { data: { level: string; text: string } }) {
  const Tag = (data.level || 'h2') as keyof React.JSX.IntrinsicElements;
  return <Tag>{data.text}</Tag>;
}

export const heading: ContentControl = {
  type: 'heading',
  label: 'Heading',
  block,
  Renderer,
};
