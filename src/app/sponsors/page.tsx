'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { SponsorGrid } from '@/components/public/SponsorGrid';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './page.module.css';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('sponsor').then(setSponsors);
  }, []);

  return (
    <PublicShell>
      <h1>Sponsors</h1>
      <SponsorGrid sponsors={sponsors} />
      {sponsors.length === 0 && (
        <p className={styles.empty}>Sponsors coming soon.</p>
      )}
    </PublicShell>
  );
}
