'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function TeamPage() {
  return (
    <DocumentList
      blockType="organiser"
      labelField="name"
      newPath="/admin/team/new"
      editPath={(id) => `/admin/team/${id}`}
    />
  );
}
