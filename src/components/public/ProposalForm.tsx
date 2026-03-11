'use client';

import { useEffect, useState } from 'react';
import {
  BlockEditor,
  useBlockForm,
  ReferenceOptionsProvider,
} from '@verevoir/editor';
import type { ReferenceOptionsMap } from '@verevoir/editor';
import { talkProposal } from '@/blocks/talk-proposal';
import { useUser } from '@/context/UserContext';
import {
  createProposal,
  updateProposal,
  submitProposal,
  getMyProposals,
  deleteProposal,
} from '@/actions/proposals';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import styles from './ProposalForm.module.css';

// Hide internal fields from the form
const HIDDEN_FIELDS = [
  'status',
  'llmPrecis',
  'llmFlags',
  'submittedAt',
  'createdBy',
];
const hiddenOverrides = Object.fromEntries(
  HIDDEN_FIELDS.map((f) => [f, () => null]),
);

export function ProposalForm() {
  const [myProposals, setMyProposals] = useState<SerializedDocument[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refOptions, setRefOptions] = useState<ReferenceOptionsMap>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [state, actions] = useBlockForm(talkProposal, {});
  const { identity, isAuthenticated } = useUser();

  const refresh = () => {
    getMyProposals()
      .then(setMyProposals)
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      listDocuments('track').then((docs) =>
        docs.map((d) => ({ id: d.id, label: String(d.data.name ?? d.id) })),
      ),
      listDocuments('speaker').then((docs) =>
        docs.map((d) => ({ id: d.id, label: String(d.data.name ?? d.id) })),
      ),
    ]).then(([tracks, speakers]) => {
      setRefOptions({ track: tracks, speaker: speakers, asset: [] });
    });
    refresh();
  }, []);

  const isPresenter =
    identity.roles.includes('presenter') ||
    identity.roles.includes('organiser');

  if (!isAuthenticated || !isPresenter) {
    return (
      <div className={styles.container}>
        <p>Sign in with a presenter account to submit proposals.</p>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    if (!actions.validate()) return;
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) {
        await updateProposal(editingId, state.value);
        setMessage('Draft updated.');
      } else {
        const doc = await createProposal(state.value);
        setEditingId(doc.id);
        setMessage('Draft saved.');
      }
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!actions.validate()) return;
    setSaving(true);
    setMessage(null);
    try {
      let id = editingId;
      if (!id) {
        const doc = await createProposal(state.value);
        id = doc.id;
      } else {
        await updateProposal(id, state.value);
      }
      await submitProposal(id);
      setEditingId(null);
      actions.onChange({});
      setMessage('Proposal submitted for review!');
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doc: SerializedDocument) => {
    setEditingId(doc.id);
    actions.onChange(doc.data);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this proposal?')) return;
    await deleteProposal(id);
    if (editingId === id) {
      setEditingId(null);
      actions.onChange({});
    }
    refresh();
  };

  const handleNew = () => {
    setEditingId(null);
    actions.onChange({});
    setMessage(null);
  };

  return (
    <div className={styles.container}>
      <h2>{editingId ? 'Edit Proposal' : 'New Proposal'}</h2>
      {message && <div className={form.info}>{message}</div>}
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
        <div className={styles.form}>
          <BlockEditor
            block={talkProposal}
            value={state.value}
            onChange={actions.onChange}
            overrides={hiddenOverrides}
          />
        </div>
      </ReferenceOptionsProvider>
      <div className={styles.toolbar}>
        {editingId && (
          <button onClick={handleNew} className={btn.secondary}>
            New Proposal
          </button>
        )}
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className={btn.secondary}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={btn.primary}
        >
          {saving ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>

      {myProposals.length > 0 && (
        <div className={styles.myProposals}>
          <h3>My Proposals</h3>
          {myProposals.map((p) => {
            const data = p.data as Record<string, unknown>;
            const status = String(data.status ?? 'draft');
            const editable =
              status === 'draft' || status === 'changes-requested';
            return (
              <div key={p.id} className={styles.proposalCard}>
                <div className={styles.proposalHeader}>
                  <strong>{String(data.title ?? 'Untitled')}</strong>
                  <span className={styles.statusBadge}>{status}</span>
                </div>
                {status === 'changes-requested' && (
                  <p className={styles.hint}>
                    Changes have been requested. Please update and resubmit.
                  </p>
                )}
                <div className={styles.proposalActions}>
                  {editable && (
                    <button
                      onClick={() => handleEdit(p)}
                      className={btn.subtle}
                    >
                      Edit
                    </button>
                  )}
                  {status === 'draft' && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className={btn.danger}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
