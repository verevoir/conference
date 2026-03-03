'use client';

import { use } from 'react';
import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function EditHighlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DocumentEditor
      blockType="highlight"
      documentId={id}
      backPath="/admin/highlights"
    />
  );
}
