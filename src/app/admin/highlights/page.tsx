'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function HighlightsPage() {
  return (
    <DocumentList
      blockType="highlight"
      labelField="title"
      newPath="/admin/highlights/new"
      editPath={(id) => `/admin/highlights/${id}`}
    />
  );
}
