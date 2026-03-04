'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { SpeakerCard } from '@/components/public/SpeakerCard';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import styles from './page.module.css';

export default function HomePage() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [speakers, setSpeakers] = useState<SerializedDocument[]>([]);
  const [sponsors, setSponsors] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('config').then((docs) => {
      if (docs.length > 0) setConfig(docs[0].data);
    });
    listDocuments('speaker', { limit: 6 }).then(setSpeakers);
    listDocuments('sponsor').then(setSponsors);
  }, []);

  return (
    <PublicShell>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {config?.conferenceName
            ? String(config.conferenceName)
            : 'Conference'}
        </h1>
        {config?.tagline ? (
          <p className={styles.tagline}>{String(config.tagline)}</p>
        ) : null}
        {config?.date ? (
          <p className={styles.date}>
            {String(config.date)}{' '}
            {config?.venue ? `\u2022 ${String(config.venue)}` : ''}
          </p>
        ) : null}
        <div className={styles.ctaRow}>
          <Link href="/schedule" className={`${btn.primary} ${btn.lg}`}>
            View Schedule
          </Link>
          <Link href="/speakers" className={`${btn.outline} ${btn.lg}`}>
            Speakers
          </Link>
        </div>
      </section>

      {speakers.length > 0 && (
        <section className={styles.section}>
          <h2>Featured Speakers</h2>
          <div className={styles.speakerGrid}>
            {speakers.map((s) => (
              <SpeakerCard key={s.id} speaker={s} />
            ))}
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className={styles.section}>
          <h2>Sponsors</h2>
          <div className={styles.sponsorGrid}>
            {sponsors.map((s) => (
              <div key={s.id} className={styles.sponsorCard}>
                <strong>{String(s.data.name)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
