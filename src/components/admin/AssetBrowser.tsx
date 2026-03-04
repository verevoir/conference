'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listAssets, uploadAsset, deleteAsset } from '@/actions/assets';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import table from '@/styles/Table.module.css';
import styles from './AssetBrowser.module.css';

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
        <div className={styles.uploadRow}>
          <input type="file" onChange={handleUpload} accept="image/*,video/*" />
        </div>
      )}
      {assets.length === 0 ? (
        <p className={styles.empty}>No assets uploaded.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Filename</th>
                <th className={table.th}>Type</th>
                <th className={table.th}>Dimensions</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className={table.tr}>
                  <td className={table.td}>{String(a.data.filename)}</td>
                  <td className={table.td}>{String(a.data.type)}</td>
                  <td className={table.td}>
                    {a.data.width && a.data.height
                      ? `${a.data.width}x${a.data.height}`
                      : '-'}
                  </td>
                  <td className={table.td}>
                    {can('delete') && (
                      <button
                        onClick={() => handleDelete(a.id)}
                        className={btn.danger}
                      >
                        Delete
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
