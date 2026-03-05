'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlockEditor, useBlockForm } from '@verevoir/editor';
import type { FieldOverrides } from '@verevoir/editor';
import { page as pageBlock } from '@/blocks/page';
import { useUser } from '@/context/UserContext';
import {
  getDocument,
  createDocument,
  updateDocument,
} from '@/actions/documents';
import {
  publishPage,
  unpublishPage,
  createNewVersion,
  listPageVersions,
} from '@/actions/pages';
import { controls, controlList } from '@/controls';
import type { ContentBlock } from '@/controls';
import { ContentBlockEditor } from './ContentBlockEditor';
import { PageStatusField } from './PageStatusField';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import editorForm from '@/styles/EditorForm.module.css';
import styles from './PageEditor.module.css';

interface PageEditorProps {
  documentId?: string;
}

const overrides: FieldOverrides = { status: PageStatusField };

export function PageEditor({ documentId }: PageEditorProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [state, actions] = useBlockForm(pageBlock, {});
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [createdBy, setCreatedBy] = useState<string | undefined>(undefined);
  const [versions, setVersions] = useState<SerializedDocument[]>([]);
  const { identity, can } = useUser();

  useEffect(() => {
    if (documentId) {
      getDocument(documentId).then((doc) => {
        if (doc) {
          setCreatedBy(doc.data.createdBy as string | undefined);
          actions.onChange(doc.data);
          setContent(
            Array.isArray(doc.data.content)
              ? (doc.data.content as ContentBlock[])
              : [],
          );
          // Load version history
          if (doc.data.slug) {
            listPageVersions(String(doc.data.slug)).then(setVersions);
          }
        }
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const isNew = !documentId;
  const status = (state.value.status as string) || 'draft';
  const version = (state.value.version as number) || 1;
  const canSave = isNew ? can('create') : can('update', { ownerId: createdBy });

  const handleSave = async () => {
    if (!canSave) return;
    if (!actions.validate()) return;
    const data = { ...state.value, content, createdBy };
    if (documentId) {
      await updateDocument(documentId, data);
    } else {
      await createDocument('page', {
        ...data,
        createdBy: identity.id,
        status: 'draft',
        version: 1,
      });
    }
    router.push('/admin/pages');
  };

  const handlePublish = async () => {
    if (!documentId) return;
    // Save first, then publish
    if (!actions.validate()) return;
    await updateDocument(documentId, {
      ...state.value,
      content,
      createdBy,
    });
    await publishPage(documentId);
    router.push('/admin/pages');
  };

  const handleUnpublish = async () => {
    if (!documentId) return;
    await unpublishPage(documentId);
    actions.onChange({ ...state.value, status: 'draft' });
  };

  const handleNewVersion = async () => {
    if (!documentId) return;
    const newDoc = await createNewVersion(documentId);
    router.push(`/admin/pages/${newDoc.id}`);
  };

  const handleAddBlock = (type: string) => {
    setContent([...content, { type }]);
  };

  const handleUpdateBlock = (index: number, data: ContentBlock) => {
    const next = [...content];
    next[index] = data;
    setContent(next);
  };

  const handleRemoveBlock = (index: number) => {
    setContent(content.filter((_, i) => i !== index));
  };

  const handleMoveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= content.length) return;
    const next = [...content];
    [next[index], next[target]] = [next[target], next[index]];
    setContent(next);
  };

  if (!loaded) return null;

  const isArchived = status === 'archived';

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1>{isNew ? 'New Page' : `Edit Page`}</h1>
        {!isNew && (
          <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
            v{version} &middot; {status}
          </span>
        )}
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

      <div className={editorForm.form}>
        <BlockEditor
          block={pageBlock}
          value={state.value}
          onChange={actions.onChange}
          overrides={overrides}
        />
      </div>

      <h2 className={styles.sectionHeading}>Content</h2>
      <div className={styles.blockList}>
        {content.map((block, index) => {
          const control = controls[block.type];
          if (!control) return null;
          return (
            <ContentBlockEditor
              key={index}
              control={control}
              data={block}
              index={index}
              total={content.length}
              onChange={(data) => handleUpdateBlock(index, data)}
              onRemove={() => handleRemoveBlock(index)}
              onMove={(dir) => handleMoveBlock(index, dir)}
            />
          );
        })}
      </div>
      {!isArchived && (
        <div className={styles.addBar}>
          {controlList.map((c) => (
            <button
              key={c.type}
              className={btn.outline}
              onClick={() => handleAddBlock(c.type)}
            >
              + {c.label}
            </button>
          ))}
        </div>
      )}

      {versions.length > 1 && (
        <>
          <h2 className={styles.sectionHeading}>Versions</h2>
          <div className={styles.versionList}>
            {versions.map((v) => (
              <div
                key={v.id}
                className={`${styles.versionRow} ${v.id === documentId ? styles.versionActive : ''}`}
              >
                <span>
                  v{String(v.data.version)} &middot;{' '}
                  <span
                    className={`${styles.badge} ${styles[`badge_${v.data.status}`]}`}
                  >
                    {String(v.data.status)}
                  </span>
                  &nbsp;&middot; {new Date(v.updatedAt).toLocaleDateString()}
                </span>
                {v.id !== documentId && (
                  <a
                    href={`/admin/pages/${v.id}`}
                    className={styles.versionLink}
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles.toolbar}>
        <button
          className={btn.secondary}
          onClick={() => router.push('/admin/pages')}
        >
          Back
        </button>
        {String(state.value.slug || '') && (
          <a
            href={`/${String(state.value.slug)}?preview=${documentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btn.outline}
          >
            Preview
          </a>
        )}
        {!isArchived && canSave && (
          <button className={btn.primary} onClick={handleSave}>
            Save Draft
          </button>
        )}
        {status === 'draft' && canSave && (
          <button
            className={btn.primary}
            onClick={handlePublish}
            style={{ background: 'var(--color-success)' }}
          >
            Publish
          </button>
        )}
        {status === 'published' && canSave && (
          <>
            <button className={btn.outline} onClick={handleUnpublish}>
              Unpublish
            </button>
            <button className={btn.primary} onClick={handleNewVersion}>
              New Version
            </button>
          </>
        )}
        {isArchived && documentId && (
          <button className={btn.primary} onClick={handleNewVersion}>
            New Version from This
          </button>
        )}
      </div>
    </div>
  );
}
