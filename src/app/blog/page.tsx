'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

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
        <p style={{ color: 'var(--color-text-muted)' }}>No posts yet.</p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.data.slug as string}`}
              style={postCardStyle}
            >
              <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem' }}>
                {String(p.data.title)}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {new Date(p.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PublicShell>
  );
}

const postCardStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  textDecoration: 'none',
  color: 'inherit',
};
