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
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import editorForm from '@/styles/EditorForm.module.css';
import styles from './ConfigEditor.module.css';

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
    <div className={styles.container}>
      <h1>Conference Config</h1>
      {!state.valid && (
        <div className={form.error}>
          {Object.entries(state.errors).map(([field, msg]) => (
            <div key={field}>
              <strong>{field}</strong>: {String(msg)}
            </div>
          ))}
        </div>
      )}
      <div className={editorForm.form}>
        <BlockEditor
          block={configBlock}
          value={state.value}
          onChange={actions.onChange}
        />
      </div>
      <div className={styles.toolbar}>
        <button
          onClick={handleSave}
          disabled={!can('update')}
          className={can('update') ? btn.primary : btn.disabled}
        >
          Save
        </button>
      </div>
    </div>
  );
}
