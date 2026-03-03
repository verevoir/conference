'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewSpeakerPage() {
  return <DocumentEditor blockType="speaker" backPath="/admin/speakers" />;
}
