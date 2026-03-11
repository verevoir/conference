'use client';

import { Suspense, use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicShell } from '@/components/public/PublicShell';
import { ContentBlocks } from '@/components/public/ContentBlocks';
import { isLive } from '@verevoir/editor';
import { listDocuments, getDocument } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import type { ContentBlock } from '@/controls';

function PageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const previewId = searchParams.get('preview');
  const [page, setPage] = useState<SerializedDocument | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (previewId) {
      getDocument(previewId).then((doc) => {
        if (doc) {
          setPage(doc);
          setIsPreview(true);
        } else {
          setNotFound(true);
        }
      });
    } else {
      listDocuments('page', { where: { slug } }).then((docs) => {
        const live = docs.find((d) => isLive(d.data));
        if (live) {
          setPage(live);
        } else {
          setNotFound(true);
        }
      });
    }
  }, [slug, previewId]);

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

  const content = Array.isArray(page.data.content)
    ? (page.data.content as ContentBlock[])
    : [];

  return (
    <PublicShell>
      {isPreview && (
        <div
          style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Preview — {String(page.data.status || 'draft')}
        </div>
      )}
      <h1>{String(page.data.title)}</h1>
      <ContentBlocks blocks={content} />
    </PublicShell>
  );
}

export default function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <Suspense
      fallback={
        <PublicShell>
          <p>Loading...</p>
        </PublicShell>
      }
    >
      <PageContent slug={slug} />
    </Suspense>
  );
}
