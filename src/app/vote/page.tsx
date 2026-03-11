'use client';

import { useEffect, useState } from 'react';
import { getConferencePhase } from '@/actions/phase';
import { VotingList } from '@/components/public/VotingList';
import type { ConferencePhase } from '@/blocks/config';

export default function VotePage() {
  const [phase, setPhase] = useState<ConferencePhase | null>(null);

  useEffect(() => {
    getConferencePhase().then(setPhase);
  }, []);

  if (phase === null) return null;

  if (phase !== 'voting') {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1>Vote on Talks</h1>
        {['setup', 'cfp', 'cfp-review'].includes(phase) && (
          <p>
            Voting has not started yet. Check back after proposals are reviewed.
          </p>
        )}
        {[
          'curation',
          'registration',
          'pre-conference',
          'live',
          'archive',
        ].includes(phase) && (
          <p>Voting is closed. The programme is being finalised.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Vote on Talks</h1>
      <p>
        Vote for the talks you&apos;d like to see at the conference. Sign in to
        cast your votes.
      </p>
      <VotingList />
    </div>
  );
}
