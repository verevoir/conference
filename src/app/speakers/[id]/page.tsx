'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { TalkCard } from '@/components/public/TalkCard';
import { getDocument, listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './page.module.css';

export default function SpeakerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [speaker, setSpeaker] = useState<SerializedDocument | null>(null);
  const [talks, setTalks] = useState<SerializedDocument[]>([]);
  const [tracks, setTracks] = useState(new Map<string, SerializedDocument>());

  useEffect(() => {
    getDocument(id).then(setSpeaker);
    listDocuments('talk').then((allTalks) => {
      setTalks(
        allTalks.filter(
          (t) => t.data.speakerId === id && t.data.status === 'published',
        ),
      );
    });
    listDocuments('track').then((docs) =>
      setTracks(new Map(docs.map((d) => [d.id, d]))),
    );
  }, [id]);

  if (!speaker)
    return (
      <PublicShell>
        <p>Loading...</p>
      </PublicShell>
    );

  const { name, bio, company, jobTitle, email, website } =
    speaker.data as Record<string, string>;

  return (
    <PublicShell>
      <Link href="/speakers" className={styles.backLink}>
        &larr; All speakers
      </Link>
      <h1 className={styles.title}>{name}</h1>
      {jobTitle && (
        <p className={styles.meta}>
          {jobTitle}
          {company ? ` at ${company}` : ''}
        </p>
      )}
      {bio && <div className={styles.bio}>{bio}</div>}
      {website && (
        <p>
          <a href={website} target="_blank" rel="noopener noreferrer">
            {website}
          </a>
        </p>
      )}
      {email && <p className={styles.email}>{email}</p>}

      {talks.length > 0 && (
        <section className={styles.talksSection}>
          <h2>Talks</h2>
          <div className={styles.talkList}>
            {talks.map((t) => {
              const track = tracks.get(t.data.trackId as string);
              return (
                <TalkCard
                  key={t.id}
                  talk={t}
                  trackName={track?.data.name as string}
                  trackColor={track?.data.color as string}
                />
              );
            })}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
