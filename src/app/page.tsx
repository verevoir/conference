'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { SpeakerCard } from '@/components/public/SpeakerCard';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

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
      <section style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px' }}>
          {config?.conferenceName
            ? String(config.conferenceName)
            : 'Conference'}
        </h1>
        {config?.tagline ? (
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-muted)',
              margin: '0 0 16px',
            }}
          >
            {String(config.tagline)}
          </p>
        ) : null}
        {config?.date ? (
          <p style={{ fontSize: '1rem', margin: '0 0 8px' }}>
            {String(config.date)}{' '}
            {config?.venue ? `\u2022 ${String(config.venue)}` : ''}
          </p>
        ) : null}
        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 12 }}>
          <Link href="/schedule" style={ctaStyle}>
            View Schedule
          </Link>
          <Link href="/speakers" style={ctaSecondary}>
            Speakers
          </Link>
        </div>
      </section>

      {speakers.length > 0 && (
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <h2>Featured Speakers</h2>
          <div style={gridStyle}>
            {speakers.map((s) => (
              <SpeakerCard key={s.id} speaker={s} />
            ))}
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <h2>Sponsors</h2>
          <div style={sponsorGridStyle}>
            {sponsors.map((s) => (
              <div key={s.id} style={sponsorCard}>
                <strong>{String(s.data.name)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}

const heroStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-xl) 0',
};

const ctaStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'var(--color-primary)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 6,
  fontWeight: 600,
};

const ctaSecondary: React.CSSProperties = {
  padding: '12px 24px',
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  textDecoration: 'none',
  borderRadius: 6,
  fontWeight: 600,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--space-md)',
};

const sponsorGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-md)',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const sponsorCard: React.CSSProperties = {
  padding: 'var(--space-md) var(--space-lg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
};
