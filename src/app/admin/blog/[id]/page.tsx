'use client';

import { use } from 'react';
import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DocumentEditor blockType="post" documentId={id} backPath="/admin/blog" />
  );
}
