'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listAssets, uploadAsset, deleteAsset } from '@/actions/assets';
import type { SerializedDocument } from '@/lib/serialization';

export function AssetBrowser() {
  const [assets, setAssets] = useState<SerializedDocument[]>([]);
  const { identity, can } = useUser();

  const refresh = () => {
    listAssets().then(setAssets);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('createdBy', identity.id);
    await uploadAsset(fd);
    refresh();
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await deleteAsset(id);
    refresh();
  };

  return (
    <div>
      <h1>Assets</h1>
      {can('create') && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <input type="file" onChange={handleUpload} accept="image/*,video/*" />
        </div>
      )}
      {assets.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No assets uploaded.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Filename</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Dimensions</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td style={tdStyle}>{String(a.data.filename)}</td>
                <td style={tdStyle}>{String(a.data.type)}</td>
                <td style={tdStyle}>
                  {a.data.width && a.data.height
                    ? `${a.data.width}x${a.data.height}`
                    : '-'}
                </td>
                <td style={tdStyle}>
                  {can('delete') && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={deleteBtnStyle}
                    >
                      Delete
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
