'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  listDocuments,
  createDocument,
  deleteDocument,
} from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import table from '@/styles/Table.module.css';
import form from '@/styles/Form.module.css';
import styles from './ScheduleBuilder.module.css';

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
        <div className={form.formRow}>
          <select
            value={talkId}
            onChange={(e) => setTalkId(e.target.value)}
            className={form.select}
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
            className={form.input}
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End"
            className={form.input}
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room"
            className={form.input}
          />
          <button onClick={handleAdd} className={btn.primary}>
            Add Slot
          </button>
        </div>
      )}
      {slots.length === 0 ? (
        <p className={styles.empty}>No schedule slots yet.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Talk</th>
                <th className={table.th}>Start</th>
                <th className={table.th}>End</th>
                <th className={table.th}>Room</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className={table.tr}>
                  <td className={table.td}>
                    {talkMap.get(slot.data.talkId as string) ??
                      (slot.data.talkId as string)}
                  </td>
                  <td className={table.td}>{String(slot.data.startTime)}</td>
                  <td className={table.td}>{String(slot.data.endTime)}</td>
                  <td className={table.td}>{String(slot.data.room)}</td>
                  <td className={table.td}>
                    {can('delete') && (
                      <button
                        onClick={() => handleRemove(slot.id)}
                        className={btn.danger}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
