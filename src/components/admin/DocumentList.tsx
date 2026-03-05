'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { listDocuments, deleteDocument } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import table from '@/styles/Table.module.css';
import styles from './DocumentList.module.css';

interface DocumentListProps {
  blockType: string;
  labelField: string;
  newPath: string;
  editPath: (id: string) => string;
}

export function DocumentList({
  blockType,
  labelField,
  newPath,
  editPath,
}: DocumentListProps) {
  const [docs, setDocs] = useState<SerializedDocument[]>([]);
  const { can } = useUser();

  const refresh = () => {
    listDocuments(blockType).then(setDocs);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockType]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await deleteDocument(id);
    refresh();
  };

  const label = blockType.charAt(0).toUpperCase() + blockType.slice(1);

  return (
    <div>
      <div className={styles.header}>
        <h1>{label}s</h1>
        {can('create') && (
          <Link href={newPath} className={btn.primary}>
            New {label}
          </Link>
        )}
      </div>
      {docs.length === 0 ? (
        <p className={styles.empty}>No {blockType}s yet.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>{labelField}</th>
                <th className={table.th}>Updated</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className={table.tr}>
                  <td className={table.td}>
                    {String(doc.data[labelField] ?? doc.id)}
                  </td>
                  <td className={table.td}>
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </td>
                  <td className={table.td}>
                    <Link href={editPath(doc.id)} className={styles.actionLink}>
                      Edit
                    </Link>
                    {can('delete') && (
                      <button
                        onClick={() => handleDelete(doc.id)}
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
