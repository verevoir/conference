'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function SpeakersPage() {
  return (
    <DocumentList
      blockType="speaker"
      labelField="name"
      newPath="/admin/speakers/new"
      editPath={(id) => `/admin/speakers/${id}`}
    />
  );
}
