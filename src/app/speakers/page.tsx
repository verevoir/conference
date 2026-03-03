'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { SpeakerCard } from '@/components/public/SpeakerCard';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('speaker').then(setSpeakers);
  }, []);

  return (
    <PublicShell>
      <h1>Speakers</h1>
      <div style={gridStyle}>
        {speakers.map((s) => (
          <SpeakerCard key={s.id} speaker={s} />
        ))}
      </div>
      {speakers.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          Speakers coming soon.
        </p>
      )}
    </PublicShell>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--space-md)',
};
