'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewPagePage() {
  return <DocumentEditor blockType="page" backPath="/admin/pages" />;
}
