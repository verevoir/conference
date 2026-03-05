'use client';

import type { FieldEditorProps } from '@verevoir/editor';
import styles from './StatusField.module.css';

/** Read-only status display — publishing is handled by PageEditor toolbar buttons. */
export function PageStatusField({ value }: FieldEditorProps) {
  const current = (value as string) || 'draft';
  return (
    <div className={styles.row}>
      <span className={styles.badge}>{current}</span>
    </div>
  );
}
