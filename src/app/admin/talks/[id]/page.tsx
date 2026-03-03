'use client';

import { use } from 'react';
import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function EditTalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DocumentEditor blockType="talk" documentId={id} backPath="/admin/talks" />
  );
}
