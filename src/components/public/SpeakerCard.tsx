import Link from 'next/link';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './SpeakerCard.module.css';

export function SpeakerCard({ speaker }: { speaker: SerializedDocument }) {
  const { name, company, jobTitle } = speaker.data as Record<string, string>;

  return (
    <Link href={`/speakers/${speaker.id}`} className={styles.card}>
      <div className={styles.avatar}>
        {(name ?? 'S').charAt(0).toUpperCase()}
      </div>
      <h3 className={styles.name}>{name}</h3>
      {jobTitle && <p className={styles.meta}>{jobTitle}</p>}
      {company && <p className={styles.meta}>{company}</p>}
    </Link>
  );
}
