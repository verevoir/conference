'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { ScheduleGrid } from '@/components/public/ScheduleGrid';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export default function SchedulePage() {
  const [slots, setSlots] = useState<SerializedDocument[]>([]);
  const [talks, setTalks] = useState(new Map<string, SerializedDocument>());
  const [speakers, setSpeakers] = useState(
    new Map<string, SerializedDocument>(),
  );
  const [tracks, setTracks] = useState(new Map<string, SerializedDocument>());

  useEffect(() => {
    listDocuments('schedule-slot').then(setSlots);
    listDocuments('talk').then((docs) =>
      setTalks(new Map(docs.map((d) => [d.id, d]))),
    );
    listDocuments('speaker').then((docs) =>
      setSpeakers(new Map(docs.map((d) => [d.id, d]))),
    );
    listDocuments('track').then((docs) =>
      setTracks(new Map(docs.map((d) => [d.id, d]))),
    );
  }, []);

  return (
    <PublicShell>
      <h1>Schedule</h1>
      <ScheduleGrid
        slots={slots}
        talks={talks}
        speakers={speakers}
        tracks={tracks}
      />
    </PublicShell>
  );
}
