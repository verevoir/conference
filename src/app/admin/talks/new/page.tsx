'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewTalkPage() {
  return <DocumentEditor blockType="talk" backPath="/admin/talks" />;
}
