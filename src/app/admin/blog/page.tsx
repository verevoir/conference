'use client';

import { DocumentList } from '@/components/admin/DocumentList';

export default function BlogPage() {
  return (
    <DocumentList
      blockType="post"
      labelField="title"
      newPath="/admin/blog/new"
      editPath={(id) => `/admin/blog/${id}`}
    />
  );
}
