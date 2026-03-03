'use client';

import { use, useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [page, setPage] = useState<SerializedDocument | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    listDocuments('page', { where: { slug } }).then((docs) => {
      const found = docs.find((d) => d.data.slug === slug);
      if (found) {
        setPage(found);
      } else {
        setNotFound(true);
      }
    });
  }, [slug]);

  if (notFound) {
    return (
      <PublicShell>
        <h1>Page not found</h1>
        <p>The page &ldquo;{slug}&rdquo; does not exist.</p>
      </PublicShell>
    );
  }

  if (!page) {
    return (
      <PublicShell>
        <p>Loading...</p>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <h1>{String(page.data.title)}</h1>
      <div style={{ marginTop: 'var(--space-lg)' }}>
        {String(page.data.body)}
      </div>
    </PublicShell>
  );
}
