'use client';

import type { FieldEditorProps } from '@verevoir/editor';
import { useUser } from '@/context/UserContext';
import btn from '@/styles/Button.module.css';
import styles from './StatusField.module.css';

interface StatusFieldProps extends FieldEditorProps {
  workflow: 'talk' | 'blog';
}

export function TalkStatusField(props: FieldEditorProps) {
  return <StatusFieldInner {...props} workflow="talk" />;
}

export function BlogStatusField(props: FieldEditorProps) {
  return <StatusFieldInner {...props} workflow="blog" />;
}

function StatusFieldInner({ value, onChange, workflow }: StatusFieldProps) {
  const { identity, talkWorkflow, blogWorkflow } = useUser();
  const wf = workflow === 'talk' ? talkWorkflow : blogWorkflow;
  const current = (value as string) || wf.initial;
  const transitions = wf.availableTransitions(current, identity);

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
