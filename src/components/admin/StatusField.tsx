'use client';

import type { FieldEditorProps } from '@verevoir/editor';
import { useUser } from '@/context/UserContext';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={badgeStyle}>{current}</span>
      {transitions.map((t) => (
        <button
          key={t.to}
          onClick={() => onChange(t.to)}
          style={transitionBtnStyle}
        >
          &rarr; {t.to}
        </button>
      ))}
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 4,
  background: 'var(--color-primary-light)',
  fontSize: '0.8125rem',
  fontWeight: 600,
};

const transitionBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  background: 'var(--color-surface)',
  cursor: 'pointer',
};
