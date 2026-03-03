'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewHighlightPage() {
  return <DocumentEditor blockType="highlight" backPath="/admin/highlights" />;
}
