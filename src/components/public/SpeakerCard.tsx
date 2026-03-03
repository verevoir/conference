import Link from 'next/link';
import type { SerializedDocument } from '@/lib/serialization';

export function SpeakerCard({ speaker }: { speaker: SerializedDocument }) {
  const { name, company, jobTitle } = speaker.data as Record<string, string>;

  return (
    <Link href={`/speakers/${speaker.id}`} style={cardStyle}>
      <div style={avatarStyle}>{(name ?? 'S').charAt(0).toUpperCase()}</div>
      <h3 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>{name}</h3>
      {jobTitle && <p style={metaStyle}>{jobTitle}</p>}
      {company && <p style={metaStyle}>{company}</p>}
    </Link>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  textDecoration: 'none',
  color: 'inherit',
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

const metaStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  color: 'var(--color-text-muted)',
};
