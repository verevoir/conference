'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function TracksPage() {
  return (
    <DocumentList
      blockType="track"
      labelField="name"
      newPath="/admin/tracks/new"
      editPath={(id) => `/admin/tracks/${id}`}
    />
  );
}
