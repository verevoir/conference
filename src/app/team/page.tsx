'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './page.module.css';

export default function TeamPage() {
  const [organisers, setOrganisers] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('organiser').then(setOrganisers);
  }, []);

  return (
    <PublicShell>
      <h1>The Team</h1>
      {organisers.length === 0 ? (
        <p className={styles.empty}>Coming soon.</p>
      ) : (
        <div className={styles.grid}>
          {organisers.map((o) => (
            <div key={o.id} className={styles.card}>
              <div className={styles.avatar}>
                {String(o.data.name ?? 'O')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <h3 className={styles.name}>{String(o.data.name)}</h3>
              <p className={styles.role}>{String(o.data.role)}</p>
              {o.data.passions ? (
                <p className={styles.passions}>{String(o.data.passions)}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PublicShell>
  );
}
