'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function SponsorsPage() {
  return (
    <DocumentList
      blockType="sponsor"
      labelField="name"
      newPath="/admin/sponsors/new"
      editPath={(id) => `/admin/sponsors/${id}`}
    />
  );
}
