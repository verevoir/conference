'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewPostPage() {
  return <DocumentEditor blockType="post" backPath="/admin/blog" />;
}
