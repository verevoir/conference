'use client';

import { controls } from '@/controls';
import type { ContentBlock } from '@/controls';
import styles from './ContentBlocks.module.css';

interface ContentBlocksProps {
  blocks: ContentBlock[];
}

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        const control = controls[block.type];
        if (!control) return null;
        const { Renderer } = control;
        return (
          <div key={index} className={styles.block}>
            <Renderer data={block} />
          </div>
        );
      })}
    </div>
  );
}
