'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { createTicketBatch, listTicketBatches } from '@/actions/registration';
import { deleteDocument } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import table from '@/styles/Table.module.css';

export default function RegistrationAdminPage() {
  const [batches, setBatches] = useState<SerializedDocument[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('GBP');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const { can } = useUser();

  const refresh = () => {
    listTicketBatches().then(setBatches);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    await createTicketBatch({
      label,
      capacity: parseInt(capacity, 10),
      price: parseFloat(price),
      currency,
      opensAt,
      closesAt,
    });
    setShowForm(false);
    setLabel('');
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ticket batch?')) return;
    await deleteDocument(id);
    refresh();
  };

  if (!can('create')) return <p>Organiser access required.</p>;

  return (
    <div>
      <h1>Ticket Batches</h1>
      <button onClick={() => setShowForm(!showForm)} className={btn.primary}>
        {showForm ? 'Cancel' : 'New Batch'}
      </button>

      {showForm && (
        <div style={{ marginTop: '1rem', maxWidth: 400 }}>
          <div className={form.field}>
            <label className={form.label}>Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={form.input}
              placeholder="Early Bird"
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Opens At (ISO date)</label>
            <input
              type="date"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Closes At (ISO date)</label>
            <input
              type="date"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className={form.input}
            />
          </div>
          <button onClick={handleCreate} className={btn.primary}>
            Create Batch
          </button>
        </div>
      )}

      {batches.length > 0 && (
        <div className={table.tableWrapper} style={{ marginTop: '1.5rem' }}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Label</th>
                <th className={table.th}>Capacity</th>
                <th className={table.th}>Sold</th>
                <th className={table.th}>Price</th>
                <th className={table.th}>Opens</th>
                <th className={table.th}>Closes</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const d = b.data as Record<string, unknown>;
                return (
                  <tr key={b.id} className={table.tr}>
                    <td className={table.td}>{String(d.label)}</td>
                    <td className={table.td}>{String(d.capacity)}</td>
                    <td className={table.td}>{String(d.sold ?? 0)}</td>
                    <td className={table.td}>
                      {String(d.currency)} {String(d.price)}
                    </td>
                    <td className={table.td}>{String(d.opensAt)}</td>
                    <td className={table.td}>{String(d.closesAt)}</td>
                    <td className={table.td}>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className={btn.danger}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
