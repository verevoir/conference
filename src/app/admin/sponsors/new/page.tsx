'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewSponsorPage() {
  return <DocumentEditor blockType="sponsor" backPath="/admin/sponsors" />;
}
