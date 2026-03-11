'use client';

import { useEffect, useState } from 'react';
import { getConferencePhase } from '@/actions/phase';
import { TicketRegistration } from '@/components/public/TicketRegistration';
import type { ConferencePhase } from '@/blocks/config';

export default function RegisterPage() {
  const [phase, setPhase] = useState<ConferencePhase | null>(null);

  useEffect(() => {
    getConferencePhase().then(setPhase);
  }, []);

  if (phase === null) return null;

  if (phase !== 'registration') {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1>Registration</h1>
        {['setup', 'cfp', 'cfp-review', 'voting', 'curation'].includes(
          phase,
        ) && (
          <p>
            Registration has not opened yet. Check back after the programme is
            finalised.
          </p>
        )}
        {['pre-conference', 'live', 'archive'].includes(phase) && (
          <p>Registration is closed.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Register for the Conference</h1>
      <p>Secure your ticket below. Tickets are released in batches.</p>
      <TicketRegistration />
    </div>
  );
}
