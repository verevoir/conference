'use client';

import { useEffect, useState } from 'react';
import { getConferencePhase } from '@/actions/phase';
import { SwagShop } from '@/components/public/SwagShop';
import type { ConferencePhase } from '@/blocks/config';

export default function ShopPage() {
  const [phase, setPhase] = useState<ConferencePhase | null>(null);

  useEffect(() => {
    getConferencePhase().then(setPhase);
  }, []);

  if (phase === null) return null;

  const shopPhases = ['registration', 'pre-conference', 'live'];

  if (!shopPhases.includes(phase)) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1>Conference Shop</h1>
        <p>The shop is not open yet. Check back during registration.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Conference Shop</h1>
      <p>Browse and purchase conference merchandise.</p>
      <SwagShop />
    </div>
  );
}
