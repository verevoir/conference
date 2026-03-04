'use client';

import { useEffect, useState } from 'react';
import { BlockEditor, useBlockForm } from '@verevoir/editor';
import { config as configBlock } from '@/blocks/config';
import { useUser } from '@/context/UserContext';
import {
  listDocuments,
  createDocument,
  updateDocument,
} from '@/actions/documents';

export function ConfigEditor() {
  const [docId, setDocId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [state, actions] = useBlockForm(configBlock, {});
  const { can } = useUser();

  useEffect(() => {
    listDocuments('config').then((docs) => {
      if (docs.length > 0) {
        setDocId(docs[0].id);
        actions.onChange(docs[0].data);
      }
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!actions.validate()) return;
    if (docId) {
      await updateDocument(docId, state.value);
    } else {
      const doc = await createDocument('config', state.value);
      setDocId(doc.id);
    }
  };

  if (!loaded) return null;

  return (
    <div>
      <h1>Conference Config</h1>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button
          onClick={handleSave}
          disabled={!can('update')}
          style={can('update') ? saveBtnStyle : disabledStyle}
        >
          Save
        </button>
      </div>
      {!state.valid && (
        <div style={errorStyle}>
          {Object.entries(state.errors).map(([field, msg]) => (
            <div key={field}>
              <strong>{field}</strong>: {String(msg)}
            </div>
          ))}
        </div>
      )}
      <BlockEditor
        block={configBlock}
        value={state.value}
        onChange={actions.onChange}
      />
    </div>
  );
}

const saveBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

const disabledStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  border: 'none',
  borderRadius: 4,
  cursor: 'not-allowed',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--color-danger)',
  fontSize: '0.875rem',
  marginBottom: 'var(--space-md)',
};
