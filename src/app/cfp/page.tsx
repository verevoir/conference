'use client';

import { useEffect, useState } from 'react';
import { getConferencePhase } from '@/actions/phase';
import { ProposalForm } from '@/components/public/ProposalForm';
import type { ConferencePhase } from '@/blocks/config';

export default function CfpPage() {
  const [phase, setPhase] = useState<ConferencePhase | null>(null);

  useEffect(() => {
    getConferencePhase().then(setPhase);
  }, []);

  if (phase === null) return null;

  if (phase !== 'cfp') {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1>Call for Papers</h1>
        {phase === 'setup' && (
          <p>The call for papers has not opened yet. Check back soon!</p>
        )}
        {phase === 'cfp-review' && (
          <p>
            The call for papers is now closed. Proposals are being reviewed.
          </p>
        )}
        {[
          'voting',
          'curation',
          'registration',
          'pre-conference',
          'live',
          'archive',
        ].includes(phase) && <p>The call for papers is closed.</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>Call for Papers</h1>
      <p>
        Submit your talk proposal for the conference. You can save drafts and
        submit when ready.
      </p>
      <ProposalForm />
    </div>
  );
}
