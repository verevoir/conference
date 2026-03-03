'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { listDocuments, deleteDocument } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';

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
      <div style={headerStyle}>
        <h1>{label}s</h1>
        {can('create') && (
          <Link href={newPath} style={newBtnStyle}>
            New {label}
          </Link>
        )}
      </div>
      {docs.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No {blockType}s yet.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>{labelField}</th>
              <th style={thStyle}>Updated</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id}>
                <td style={tdStyle}>
                  {String(doc.data[labelField] ?? doc.id)}
                </td>
                <td style={tdStyle}>
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </td>
                <td style={tdStyle}>
                  <Link href={editPath(doc.id)} style={actionLink}>
                    Edit
                  </Link>
                  {can('delete') && (
                    <button
                      onClick={() => handleDelete(doc.id)}
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

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-lg)',
};

const newBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--color-primary)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 4,
  fontSize: '0.875rem',
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

const actionLink: React.CSSProperties = {
  marginRight: 8,
  color: 'var(--color-primary)',
  textDecoration: 'none',
  fontSize: '0.8125rem',
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-danger)',
  cursor: 'pointer',
  fontSize: '0.8125rem',
};
