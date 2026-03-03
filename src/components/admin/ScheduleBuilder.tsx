'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  listDocuments,
  createDocument,
  deleteDocument,
} from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

export function ScheduleBuilder() {
  const [slots, setSlots] = useState<SerializedDocument[]>([]);
  const [talks, setTalks] = useState<SerializedDocument[]>([]);
  const [talkId, setTalkId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const { can } = useUser();

  const refresh = () => {
    listDocuments('schedule-slot', { orderBy: { createdAt: 'asc' } }).then(
      setSlots,
    );
  };

  useEffect(() => {
    refresh();
    listDocuments('talk').then(setTalks);
  }, []);

  const handleAdd = async () => {
    if (!talkId || !startTime || !endTime || !room) return;
    await createDocument('schedule-slot', { talkId, startTime, endTime, room });
    setTalkId('');
    setStartTime('');
    setEndTime('');
    setRoom('');
    refresh();
  };

  const handleRemove = async (id: string) => {
    await deleteDocument(id);
    refresh();
  };

  const talkMap = new Map(talks.map((t) => [t.id, t.data.title as string]));

  return (
    <div>
      <h1>Schedule Builder</h1>
      {can('create') && (
        <div style={formStyle}>
          <select
            value={talkId}
            onChange={(e) => setTalkId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select talk...</option>
            {talks.map((t) => (
              <option key={t.id} value={t.id}>
                {String(t.data.title)}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start"
            style={inputStyle}
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End"
            style={inputStyle}
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room"
            style={inputStyle}
          />
          <button onClick={handleAdd} style={addBtnStyle}>
            Add Slot
          </button>
        </div>
      )}
      {slots.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No schedule slots yet.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Talk</th>
              <th style={thStyle}>Start</th>
              <th style={thStyle}>End</th>
              <th style={thStyle}>Room</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id}>
                <td style={tdStyle}>
                  {talkMap.get(slot.data.talkId as string) ??
                    (slot.data.talkId as string)}
                </td>
                <td style={tdStyle}>{String(slot.data.startTime)}</td>
                <td style={tdStyle}>{String(slot.data.endTime)}</td>
                <td style={tdStyle}>{String(slot.data.room)}</td>
                <td style={tdStyle}>
                  {can('delete') && (
                    <button
                      onClick={() => handleRemove(slot.id)}
                      style={deleteBtnStyle}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginBottom: 'var(--space-lg)',
  flexWrap: 'wrap',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  fontSize: '0.875rem',
};

const addBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid var(--color-border)',
  fontSize: '0.8125rem',
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '0.875rem',
};
const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-danger)',
  cursor: 'pointer',
  fontSize: '0.8125rem',
};
