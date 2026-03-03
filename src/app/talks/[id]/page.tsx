'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { BookmarkButton } from '@/components/public/BookmarkButton';
import { FeedbackForm } from '@/components/public/FeedbackForm';
import { getDocument, listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function TalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [talk, setTalk] = useState<SerializedDocument | null>(null);
  const [speaker, setSpeaker] = useState<SerializedDocument | null>(null);
  const [track, setTrack] = useState<SerializedDocument | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    getDocument(id).then((t) => {
      setTalk(t);
      if (t) {
        if (t.data.speakerId)
          getDocument(t.data.speakerId as string).then(setSpeaker);
        if (t.data.trackId)
          getDocument(t.data.trackId as string).then(setTrack);
      }
    });
    listDocuments('config').then((docs) => {
      if (docs.length > 0) {
        setFeedbackOpen(docs[0].data.feedbackOpen === true);
      }
    });
  }, [id]);

  if (!talk)
    return (
      <PublicShell>
        <p>Loading...</p>
      </PublicShell>
    );

  const { title, abstract, level, duration } = talk.data as Record<
    string,
    unknown
  >;

  return (
    <PublicShell>
      <Link href="/schedule" style={{ fontSize: '0.875rem' }}>
        &larr; Schedule
      </Link>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: 'var(--space-md)',
        }}
      >
        <h1>{String(title)}</h1>
        <BookmarkButton talkId={id} />
      </div>
      <div style={metaRow}>
        {track && (
          <span
            style={{
              ...tagStyle,
              background:
                (track.data.color as string) ?? 'var(--color-primary-light)',
            }}
          >
            {String(track.data.name)}
          </span>
        )}
        {level ? <span style={tagStyle}>{String(level)}</span> : null}
        {duration ? (
          <span
            style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
          >
            {String(duration)} minutes
          </span>
        ) : null}
      </div>
      {speaker && (
        <p style={{ marginTop: 'var(--space-md)' }}>
          Speaker:{' '}
          <Link href={`/speakers/${speaker.id}`}>
            {String(speaker.data.name)}
          </Link>
        </p>
      )}
      {abstract ? (
        <div style={{ marginTop: 'var(--space-lg)' }}>{String(abstract)}</div>
      ) : null}

      {feedbackOpen && <FeedbackForm talkId={id} />}
    </PublicShell>
  );
}

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
  fontSize: '0.8125rem',
};
