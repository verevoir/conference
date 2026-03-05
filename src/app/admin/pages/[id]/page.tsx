'use client';

import { use } from 'react';
import { PageEditor } from '@/components/admin/PageEditor';

export default function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PageEditor documentId={id} />;
}
