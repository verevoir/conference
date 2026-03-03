'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewTrackPage() {
  return <DocumentEditor blockType="track" backPath="/admin/tracks" />;
}
