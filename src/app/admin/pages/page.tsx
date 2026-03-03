'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function PagesPage() {
  return (
    <DocumentList
      blockType="page"
      labelField="title"
      newPath="/admin/pages/new"
      editPath={(id) => `/admin/pages/${id}`}
    />
  );
}
