'use client';

import { use } from 'react';
import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function EditSponsorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DocumentEditor
      blockType="sponsor"
      documentId={id}
      backPath="/admin/sponsors"
    />
  );
}
