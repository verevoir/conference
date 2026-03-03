'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function TeamPage() {
  const [organisers, setOrganisers] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('organiser').then(setOrganisers);
  }, []);

  return (
    <PublicShell>
      <h1>The Team</h1>
      {organisers.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Coming soon.</p>
      ) : (
        <div style={gridStyle}>
          {organisers.map((o) => (
            <div key={o.id} style={cardStyle}>
              <div style={avatarStyle}>
                {String(o.data.name ?? 'O')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>
                {String(o.data.name)}
              </h3>
              <p style={roleStyle}>{String(o.data.role)}</p>
              {o.data.passions ? (
                <p style={metaStyle}>{String(o.data.passions)}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PublicShell>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'var(--space-md)',
};

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  textAlign: 'center',
};

const avatarStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'var(--color-primary-light)',
  color: 'var(--color-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 700,
  margin: '0 auto',
};

const roleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: 'var(--color-primary)',
};

const metaStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '0.8125rem',
  color: 'var(--color-text-muted)',
};
