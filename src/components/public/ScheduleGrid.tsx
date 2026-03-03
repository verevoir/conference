'use client';

import type { SerializedDocument } from '@/lib/serialization';
import { TalkCard } from './TalkCard';

interface ScheduleGridProps {
  slots: SerializedDocument[];
  talks: Map<string, SerializedDocument>;
  speakers: Map<string, SerializedDocument>;
  tracks: Map<string, SerializedDocument>;
}

export function ScheduleGrid({
  slots,
  talks,
  speakers,
  tracks,
}: ScheduleGridProps) {
  // Group slots by date
  const byDate = new Map<string, SerializedDocument[]>();
  for (const slot of slots) {
    const start = String(slot.data.startTime);
    const date = start.split('T')[0] ?? start;
    const group = byDate.get(date) ?? [];
    group.push(slot);
    byDate.set(date, group);
  }

  // Sort each group by start time
  for (const group of byDate.values()) {
    group.sort((a, b) =>
      String(a.data.startTime).localeCompare(String(b.data.startTime)),
    );
  }

  const dates = [...byDate.keys()].sort();

  if (dates.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-muted)' }}>Schedule coming soon.</p>
    );
  }

  return (
    <div>
      {dates.map((date) => (
        <div key={date} style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>{date}</h2>
          <div style={gridStyle}>
            {byDate.get(date)!.map((slot) => {
              const talk = talks.get(slot.data.talkId as string);
              if (!talk) return null;
              const speaker = speakers.get(talk.data.speakerId as string);
              const track = tracks.get(talk.data.trackId as string);
              return (
                <div key={slot.id}>
                  <div style={timeStyle}>
                    {formatTime(String(slot.data.startTime))} &ndash;{' '}
                    {formatTime(String(slot.data.endTime))} |{' '}
                    {String(slot.data.room)}
                  </div>
                  <TalkCard
                    talk={talk}
                    speakerName={speaker?.data.name as string}
                    trackName={track?.data.name as string}
                    trackColor={track?.data.color as string}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

const timeStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-xs)',
};
