'use client';

import type { FieldEditorProps } from '@verevoir/editor';
import { useUser } from '@/context/UserContext';
import btn from '@/styles/Button.module.css';
import styles from './StatusField.module.css';

export function ProposalStatusField({ value, onChange }: FieldEditorProps) {
  const { identity, proposalWorkflow } = useUser();
  const current = (value as string) || proposalWorkflow.initial;
  const transitions = proposalWorkflow.availableTransitions(current, identity);

  return (
    <div className={styles.row}>
      <span className={styles.badge}>{current}</span>
      {transitions.map((t) => (
        <button
          key={t.to}
          onClick={() => onChange(t.to)}
          className={`${btn.subtle} ${btn.sm}`}
        >
          &rarr; {t.to}
        </button>
      ))}
    </div>
  );
}
