'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function TalksPage() {
  return (
    <DocumentList
      blockType="talk"
      labelField="title"
      newPath="/admin/talks/new"
      editPath={(id) => `/admin/talks/${id}`}
    />
  );
}
