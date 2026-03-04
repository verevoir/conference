'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { SpeakerCard } from '@/components/public/SpeakerCard';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './page.module.css';

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('speaker').then(setSpeakers);
  }, []);

  return (
    <PublicShell>
      <h1>Speakers</h1>
      <div className={styles.grid}>
        {speakers.map((s) => (
          <SpeakerCard key={s.id} speaker={s} />
        ))}
      </div>
      {speakers.length === 0 && (
        <p className={styles.empty}>Speakers coming soon.</p>
      )}
    </PublicShell>
  );
}
