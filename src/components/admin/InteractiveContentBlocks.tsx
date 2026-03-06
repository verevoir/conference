'use client';

import { InteractiveContentBlocks as InteractiveBlocks } from '@verevoir/editor-premium';
import '@verevoir/editor-premium/styles/interactive-editor.css';
import { controls, controlList } from '@/controls';
import type { ContentBlock } from '@/controls';
import { ContentBlockEditor } from './ContentBlockEditor';
import contentStyles from '@/components/public/ContentBlocks.module.css';

interface InteractiveContentBlocksProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function InteractiveContentBlocks({
  blocks,
  onChange,
}: InteractiveContentBlocksProps) {
  return (
    <InteractiveBlocks
      blocks={blocks}
      controls={controls}
      controlList={controlList}
      onChange={onChange}
      blockClassName={contentStyles.block}
      className={contentStyles.content}
      renderEditor={(props) => (
        <ContentBlockEditor
          control={props.control}
          data={props.data}
          index={props.index}
          total={props.total}
          onChange={props.onChange}
          onRemove={props.onRemove}
          onMove={props.onMove}
        />
      )}
    />
  );
}
