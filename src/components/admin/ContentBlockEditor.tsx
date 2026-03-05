'use client';

import { BlockEditor } from '@verevoir/editor';
import type { ContentControl, ContentBlock } from '@/controls';
import { ImageBlockEditor } from '@/controls/image';
import btn from '@/styles/Button.module.css';
import editorForm from '@/styles/EditorForm.module.css';
import styles from './ContentBlockEditor.module.css';

interface ContentBlockEditorProps {
  control: ContentControl;
  data: ContentBlock;
  index: number;
  total: number;
  onChange: (data: ContentBlock) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function ContentBlockEditor({
  control,
  data,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: ContentBlockEditorProps) {
  const { type, ...blockData } = data;

  const handleChange = (value: Record<string, unknown>) => {
    onChange({ type, ...value });
  };

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.label}>{control.label}</span>
        <div className={styles.actions}>
          <button
            className={btn.ghost}
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
          >
            &#9650;
          </button>
          <button
            className={btn.ghost}
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            &#9660;
          </button>
          <button className={btn.danger} onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      {type === 'image' && (
        <ImageBlockEditor data={blockData} onChange={handleChange} />
      )}
      <div className={editorForm.form}>
        <BlockEditor
          block={control.block}
          value={blockData}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
