'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './page.module.css';

export default function BlogPage() {
  const [posts, setPosts] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('post').then((docs) =>
      setPosts(docs.filter((d) => d.data.status === 'published')),
    );
  }, []);

  return (
    <PublicShell>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p className={styles.empty}>No posts yet.</p>
      ) : (
        <div className={styles.list}>
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.data.slug as string}`}
              className={styles.postCard}
            >
              <h2 className={styles.postTitle}>{String(p.data.title)}</h2>
              <p className={styles.postDate}>
                {new Date(p.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PublicShell>
  );
}
