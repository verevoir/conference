'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listProposals } from '@/actions/proposals';
import { listDocuments } from '@/actions/documents';
import {
  castVote,
  removeVote,
  getMyVotes,
  getVoteTally,
} from '@/actions/votes';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import styles from './VotingList.module.css';

export function VotingList() {
  const [proposals, setProposals] = useState<SerializedDocument[]>([]);
  const [speakers, setSpeakers] = useState<Map<string, string>>(new Map());
  const [tracks, setTracks] = useState<Map<string, string>>(new Map());
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [tallies, setTallies] = useState<Map<string, number>>(new Map());
  const { isAuthenticated } = useUser();

  const refresh = () => {
    listProposals({ where: { status: 'accepted' } }).then(setProposals);
    listDocuments('speaker').then((docs) => {
      const map = new Map<string, string>();
      docs.forEach((d) => map.set(d.id, String(d.data.name ?? 'Unknown')));
      setSpeakers(map);
    });
    listDocuments('track').then((docs) => {
      const map = new Map<string, string>();
      docs.forEach((d) => map.set(d.id, String(d.data.name ?? 'Unknown')));
      setTracks(map);
    });
    if (isAuthenticated) {
      getMyVotes()
        .then((v) => setMyVotes(new Set(v)))
        .catch(() => {});
    }
    // Fetch tallies per proposal
    listProposals({ where: { status: 'accepted' } }).then((props) => {
      Promise.all(
        props.map((p) =>
          getVoteTally(p.id).then((count) => ({ id: p.id, count })),
        ),
      ).then((results) => {
        const map = new Map<string, number>();
        results.forEach((r) => map.set(r.id, r.count));
        setTallies(map);
      });
    });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleVote = async (proposalId: string) => {
    if (myVotes.has(proposalId)) {
      await removeVote(proposalId);
      setMyVotes((prev) => {
        const next = new Set(prev);
        next.delete(proposalId);
        return next;
      });
      setTallies((prev) => {
        const next = new Map(prev);
        next.set(proposalId, (next.get(proposalId) ?? 1) - 1);
        return next;
      });
    } else {
      await castVote(proposalId);
      setMyVotes((prev) => new Set(prev).add(proposalId));
      setTallies((prev) => {
        const next = new Map(prev);
        next.set(proposalId, (next.get(proposalId) ?? 0) + 1);
        return next;
      });
    }
  };

  if (proposals.length === 0) {
    return <p>No proposals available for voting yet.</p>;
  }

  return (
    <div className={styles.list}>
      {proposals.map((p) => {
        const data = p.data as Record<string, unknown>;
        const voted = myVotes.has(p.id);
        return (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.title}>{String(data.title ?? '')}</h3>
              <div className={styles.voteSection}>
                <span className={styles.voteCount}>
                  {tallies.get(p.id) ?? 0}
                </span>
                {isAuthenticated && (
                  <button
                    onClick={() => handleVote(p.id)}
                    className={voted ? btn.primary : btn.secondary}
                  >
                    {voted ? 'Voted' : 'Vote'}
                  </button>
                )}
              </div>
            </div>
            <div className={styles.meta}>
              {speakers.get(String(data.speakerId ?? '')) && (
                <span>{speakers.get(String(data.speakerId ?? ''))}</span>
              )}
              {tracks.get(String(data.trackId ?? '')) && (
                <span className={styles.tag}>
                  {tracks.get(String(data.trackId ?? ''))}
                </span>
              )}
              {data.level ? (
                <span className={styles.tag}>{String(data.level)}</span>
              ) : null}
              {data.duration ? <span>{String(data.duration)} min</span> : null}
            </div>
            {data.llmPrecis ? (
              <p className={styles.precis}>{String(data.llmPrecis)}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
