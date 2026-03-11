'use client';

import { useEffect, useState } from 'react';
import { listTallies } from '@/actions/votes';
import { listProposals } from '@/actions/proposals';
import table from '@/styles/Table.module.css';

export default function VotesPage() {
  const [tallies, setTallies] = useState<
    Array<{ proposalId: string; votes: number }>
  >([]);
  const [proposals, setProposals] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    listTallies()
      .then(setTallies)
      .catch(() => {});
    listProposals().then((docs) => {
      const map = new Map<string, string>();
      docs.forEach((d) => map.set(d.id, String(d.data.title ?? 'Untitled')));
      setProposals(map);
    });
  }, []);

  return (
    <div>
      <h1>Vote Tallies</h1>
      {tallies.length === 0 ? (
        <p>No votes recorded yet.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Rank</th>
                <th className={table.th}>Proposal</th>
                <th className={table.th}>Votes</th>
              </tr>
            </thead>
            <tbody>
              {tallies.map((t, i) => (
                <tr key={t.proposalId} className={table.tr}>
                  <td className={table.td}>{i + 1}</td>
                  <td className={table.td}>
                    {proposals.get(t.proposalId) ?? t.proposalId}
                  </td>
                  <td className={table.td}>{t.votes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
