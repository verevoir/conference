'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments, getDocument } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<SerializedDocument | null>(null);
  const [author, setAuthor] = useState<SerializedDocument | null>(null);

  useEffect(() => {
    listDocuments('post', { where: { slug } }).then((docs) => {
      const found = docs.find(
        (d) => d.data.slug === slug && d.data.status === 'published',
      );
      if (found) {
        setPost(found);
        if (found.data.authorId) {
          getDocument(found.data.authorId as string).then(setAuthor);
        }
      }
    });
  }, [slug]);

  if (!post) {
    return (
      <PublicShell>
        <p>Loading...</p>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <Link href="/blog" style={{ fontSize: '0.875rem' }}>
        &larr; All posts
      </Link>
      <h1 style={{ marginTop: 'var(--space-md)' }}>
        {String(post.data.title)}
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        {new Date(post.updatedAt).toLocaleDateString()}
        {author && ` \u2022 ${String(author.data.name)}`}
      </p>
      <div style={{ marginTop: 'var(--space-lg)' }}>
        {String(post.data.body)}
      </div>
    </PublicShell>
  );
}
