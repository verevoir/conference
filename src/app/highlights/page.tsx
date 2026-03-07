'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import { markdownToHtml } from '@verevoir/editor';
import styles from './page.module.css';

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('highlight').then(setHighlights);
  }, []);

  return (
    <PublicShell>
      <h1>Past Highlights</h1>
      {highlights.length === 0 ? (
        <p className={styles.empty}>No highlights yet.</p>
      ) : (
        <div className={styles.grid}>
          {highlights.map((h) => (
            <div key={h.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{String(h.data.title)}</h3>
              {h.data.year ? (
                <span className={styles.yearBadge}>{String(h.data.year)}</span>
              ) : null}
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(String(h.data.description)),
                }}
              />
              {h.data.stat ? (
                <p className={styles.stat}>{String(h.data.stat)}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PublicShell>
  );
}
