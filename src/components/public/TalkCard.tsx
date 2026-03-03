'use client';

import Link from 'next/link';
import type { SerializedDocument } from '@/lib/serialization';
import { BookmarkButton } from './BookmarkButton';

interface TalkCardProps {
  talk: SerializedDocument;
  speakerName?: string;
  trackName?: string;
  trackColor?: string;
}

export function TalkCard({
  talk,
  speakerName,
  trackName,
  trackColor,
}: TalkCardProps) {
  const { title, level, duration } = talk.data as Record<string, unknown>;

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Link href={`/talks/${talk.id}`} style={titleLink}>
          {String(title)}
        </Link>
        <BookmarkButton talkId={talk.id} />
      </div>
      <div style={metaRow}>
        {trackName && (
          <span
            style={{
              ...tagStyle,
              background: trackColor ?? 'var(--color-primary-light)',
            }}
          >
            {trackName}
          </span>
        )}
        {level ? <span style={tagStyle}>{String(level)}</span> : null}
        {duration ? (
          <span
            style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}
          >
            {String(duration)} min
          </span>
        ) : null}
      </div>
      {speakerName && (
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
          }}
        >
          {speakerName}
        </p>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
};

const titleLink: React.CSSProperties = {
  fontWeight: 600,
  textDecoration: 'none',
  color: 'inherit',
  fontSize: '1rem',
};

const metaRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  marginTop: 'var(--space-xs)',
};

const tagStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 4,
  background: 'var(--color-surface)',
  fontSize: '0.75rem',
};
