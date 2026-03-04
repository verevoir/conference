'use client';

import Link from 'next/link';
import type { SerializedDocument } from '@/lib/serialization';
import { BookmarkButton } from './BookmarkButton';
import styles from './TalkCard.module.css';

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
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href={`/talks/${talk.id}`} className={styles.titleLink}>
          {String(title)}
        </Link>
        <BookmarkButton talkId={talk.id} />
      </div>
      <div className={styles.metaRow}>
        {trackName && (
          <span
            className={styles.tag}
            style={{
              background: trackColor ?? 'var(--color-primary-light)',
            }}
          >
            {trackName}
          </span>
        )}
        {level ? <span className={styles.tag}>{String(level)}</span> : null}
        {duration ? (
          <span className={styles.duration}>{String(duration)} min</span>
        ) : null}
      </div>
      {speakerName && <p className={styles.speaker}>{speakerName}</p>}
    </div>
  );
}
