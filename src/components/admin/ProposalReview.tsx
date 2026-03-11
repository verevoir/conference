'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  listProposals,
  reviewProposal,
  analyzeProposal,
  promoteToTalk,
} from '@/actions/proposals';
import { listDocuments } from '@/actions/documents';
import { listTallies } from '@/actions/votes';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import table from '@/styles/Table.module.css';
import styles from './ProposalReview.module.css';

type StatusFilter =
  | 'all'
  | 'submitted'
  | 'flagged'
  | 'accepted'
  | 'rejected'
  | 'changes-requested';

export function ProposalReview() {
  const [proposals, setProposals] = useState<SerializedDocument[]>([]);
  const [speakers, setSpeakers] = useState<Map<string, string>>(new Map());
  const [tallies, setTallies] = useState<Map<string, number>>(new Map());
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const { can } = useUser();

  const refresh = () => {
    listProposals().then(setProposals);
    listDocuments('speaker').then((docs) => {
      const map = new Map<string, string>();
      docs.forEach((d) => map.set(d.id, String(d.data.name ?? 'Unknown')));
      setSpeakers(map);
    });
    listTallies()
      .then((t) => {
        const map = new Map<string, number>();
        t.forEach((entry) => map.set(entry.proposalId, entry.votes));
        setTallies(map);
      })
      .catch(() => {
        // May fail if not organiser
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered =
    filter === 'all'
      ? proposals
      : proposals.filter((p) => p.data.status === filter);

  const handleReview = async (
    id: string,
    decision: 'accepted' | 'rejected' | 'flagged' | 'changes-requested',
  ) => {
    await reviewProposal(id, decision);
    refresh();
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzing(id);
    try {
      await analyzeProposal(id);
      refresh();
    } finally {
      setAnalyzing(null);
    }
  };

  const handlePromote = async (id: string) => {
    await promoteToTalk(id);
    refresh();
  };

  if (!can('create')) return <p>Organiser access required.</p>;

  const filters: StatusFilter[] = [
    'all',
    'submitted',
    'flagged',
    'accepted',
    'rejected',
    'changes-requested',
  ];

  return (
    <div>
      <h1>Proposal Review</h1>
      <div className={styles.filters}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? btn.primary : btn.secondary}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} (
            {f === 'all'
              ? proposals.length
              : proposals.filter((p) => p.data.status === f).length}
            )
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p>No proposals{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Title</th>
                <th className={table.th}>Speaker</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Votes</th>
                <th className={table.th}>Précis</th>
                <th className={table.th}>Flags</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const data = p.data as Record<string, unknown>;
                const status = String(data.status ?? 'draft');
                return (
                  <tr key={p.id} className={table.tr}>
                    <td className={table.td}>{String(data.title ?? '')}</td>
                    <td className={table.td}>
                      {speakers.get(String(data.speakerId ?? '')) ?? '-'}
                    </td>
                    <td className={table.td}>
                      <span
                        className={styles[`status-${status}`] || styles.status}
                      >
                        {status}
                      </span>
                    </td>
                    <td className={table.td}>{tallies.get(p.id) ?? 0}</td>
                    <td className={table.td}>
                      <span className={styles.truncated}>
                        {data.llmPrecis ? String(data.llmPrecis) : '-'}
                      </span>
                    </td>
                    <td className={table.td}>
                      <span className={styles.truncated}>
                        {data.llmFlags ? String(data.llmFlags) : '-'}
                      </span>
                    </td>
                    <td className={table.td}>
                      <div className={styles.actions}>
                        {(status === 'submitted' || status === 'flagged') && (
                          <>
                            <button
                              onClick={() => handleReview(p.id, 'accepted')}
                              className={btn.subtle}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReview(p.id, 'rejected')}
                              className={btn.subtle}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() =>
                                handleReview(p.id, 'changes-requested')
                              }
                              className={btn.subtle}
                            >
                              Changes
                            </button>
                          </>
                        )}
                        {status === 'submitted' && (
                          <button
                            onClick={() => handleAnalyze(p.id)}
                            className={btn.subtle}
                            disabled={analyzing === p.id}
                          >
                            {analyzing === p.id ? 'Analyzing...' : 'Analyze'}
                          </button>
                        )}
                        {status === 'accepted' && (
                          <button
                            onClick={() => handlePromote(p.id)}
                            className={btn.subtle}
                          >
                            Promote to Talk
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
