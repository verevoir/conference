'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('highlight').then(setHighlights);
  }, []);

  return (
    <PublicShell>
      <h1>Past Highlights</h1>
      {highlights.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No highlights yet.</p>
      ) : (
        <div style={gridStyle}>
          {highlights.map((h) => (
            <div key={h.id} style={cardStyle}>
              <h3 style={{ margin: '0 0 8px' }}>{String(h.data.title)}</h3>
              {h.data.year ? (
                <span style={yearBadge}>{String(h.data.year)}</span>
              ) : null}
              <p style={{ fontSize: '0.875rem', margin: '8px 0' }}>
                {String(h.data.description)}
              </p>
              {h.data.stat ? (
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    margin: '8px 0 0',
                    color: 'var(--color-primary)',
                  }}
                >
                  {String(h.data.stat)}
                </p>
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
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 'var(--space-md)',
};

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
};

const yearBadge: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 4,
  background: 'var(--color-primary-light)',
  fontSize: '0.75rem',
  fontWeight: 600,
};
