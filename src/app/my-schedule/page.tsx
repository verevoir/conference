'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { ScheduleGrid } from '@/components/public/ScheduleGrid';
import { useUser } from '@/context/UserContext';
import { getMyBookmarks } from '@/actions/bookmarks';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

function MyScheduleContent() {
  const { identity, isAuthenticated } = useUser();
  const [slots, setSlots] = useState<SerializedDocument[]>([]);
  const [talks, setTalks] = useState(new Map<string, SerializedDocument>());
  const [speakers, setSpeakers] = useState(
    new Map<string, SerializedDocument>(),
  );
  const [tracks, setTracks] = useState(new Map<string, SerializedDocument>());

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([
      getMyBookmarks(identity.id),
      listDocuments('schedule-slot'),
      listDocuments('talk'),
      listDocuments('speaker'),
      listDocuments('track'),
    ]).then(([bookmarks, allSlots, allTalks, allSpeakers, allTracks]) => {
      const bookmarkedTalkIds = new Set(
        bookmarks.map((b) => b.data.talkId as string),
      );
      setSlots(
        allSlots.filter((s) => bookmarkedTalkIds.has(s.data.talkId as string)),
      );
      setTalks(new Map(allTalks.map((d) => [d.id, d])));
      setSpeakers(new Map(allSpeakers.map((d) => [d.id, d])));
      setTracks(new Map(allTracks.map((d) => [d.id, d])));
    });
  }, [isAuthenticated, identity.id]);

  if (!isAuthenticated) {
    return (
      <p style={{ color: 'var(--color-text-muted)' }}>
        Sign in to build your personal schedule.
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-muted)' }}>
        No bookmarked talks yet. Browse the schedule and bookmark talks you want
        to attend.
      </p>
    );
  }

  return (
    <ScheduleGrid
      slots={slots}
      talks={talks}
      speakers={speakers}
      tracks={tracks}
    />
  );
}

export default function MySchedulePage() {
  return (
    <PublicShell>
      <h1>My Schedule</h1>
      <MyScheduleContent />
    </PublicShell>
  );
}
