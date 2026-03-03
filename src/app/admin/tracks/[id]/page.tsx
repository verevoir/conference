'use client';

import { use } from 'react';
import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function EditTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DocumentEditor
      blockType="track"
      documentId={id}
      backPath="/admin/tracks"
    />
  );
}
