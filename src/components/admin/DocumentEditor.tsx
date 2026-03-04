'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BlockEditor,
  useBlockForm,
  ReferenceOptionsProvider,
} from '@verevoir/editor';
import type { ReferenceOptionsMap, FieldOverrides } from '@verevoir/editor';
import { blocks } from '@/blocks';
import { useUser } from '@/context/UserContext';
import {
  getDocument,
  createDocument,
  updateDocument,
  listDocuments,
} from '@/actions/documents';
import { TalkStatusField, BlogStatusField } from './StatusField';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import styles from './DocumentEditor.module.css';

interface DocumentEditorProps {
  blockType: string;
  documentId?: string;
  backPath: string;
}

const talkOverrides: FieldOverrides = { status: TalkStatusField };
const postOverrides: FieldOverrides = { status: BlogStatusField };

function getOverrides(blockType: string): FieldOverrides | undefined {
  if (blockType === 'talk') return talkOverrides;
  if (blockType === 'post') return postOverrides;
  return undefined;
}

export function DocumentEditor({
  blockType,
  documentId,
  backPath,
}: DocumentEditorProps) {
  const router = useRouter();
  const block = blocks[blockType];
  const [loaded, setLoaded] = useState(false);
  const [state, actions] = useBlockForm(block, {});
  const [refOptions, setRefOptions] = useState<ReferenceOptionsMap>({});
  const [createdBy, setCreatedBy] = useState<string | undefined>(undefined);
  const { identity, can } = useUser();

  useEffect(() => {
    // Load reference options for all reference-type blocks
    Promise.all([
      listDocuments('speaker').then((docs) =>
        docs.map((d) => ({
          id: d.id,
          label: String(d.data.name ?? d.id),
        })),
      ),
      listDocuments('track').then((docs) =>
        docs.map((d) => ({
          id: d.id,
          label: String(d.data.name ?? d.id),
        })),
      ),
      listDocuments('talk').then((docs) =>
        docs.map((d) => ({
          id: d.id,
          label: String(d.data.title ?? d.id),
        })),
      ),
    ]).then(([speakers, tracks, talks]) => {
      setRefOptions({
        speaker: speakers,
        track: tracks,
        talk: talks,
        asset: [], // Assets are managed separately
      });
    });
  }, []);

  useEffect(() => {
    if (documentId) {
      getDocument(documentId).then((doc) => {
        if (doc) {
          setCreatedBy(doc.data.createdBy as string | undefined);
          actions.onChange(doc.data);
        }
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const isNew = !documentId;
  const canSave = isNew ? can('create') : can('update', { ownerId: createdBy });

  const handleSave = async () => {
    if (!canSave) return;
    if (!actions.validate()) return;
    if (documentId) {
      await updateDocument(documentId, { ...state.value, createdBy });
    } else {
      await createDocument(blockType, {
        ...state.value,
        createdBy: identity.id,
      });
    }
    router.push(backPath);
  };

  if (!loaded) return null;

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1);

  return (
    <div>
      <h1>{documentId ? `Edit ${label}` : `New ${label}`}</h1>
      <div className={styles.toolbar}>
        <button className={btn.secondary} onClick={() => router.push(backPath)}>
          Back
        </button>
        <button
          className={canSave ? btn.primary : btn.disabled}
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </button>
      </div>
      {!state.valid && (
        <div className={form.error}>
          {Object.entries(state.errors).map(([field, msg]) => (
            <div key={field}>
              <strong>{field}</strong>: {String(msg)}
            </div>
          ))}
        </div>
      )}
      <ReferenceOptionsProvider options={refOptions}>
        <BlockEditor
          block={block}
          value={state.value}
          onChange={actions.onChange}
          overrides={getOverrides(blockType)}
        />
      </ReferenceOptionsProvider>
    </div>
  );
}
