'use client';

import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewTeamMemberPage() {
  return <DocumentEditor blockType="organiser" backPath="/admin/team" />;
}
