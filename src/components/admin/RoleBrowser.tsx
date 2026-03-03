'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listRoleAssignments, setUserRoles } from '@/actions/roles';

interface Assignment {
  userId: string;
  roles: string[];
}

const availableRoles = ['organiser', 'delegate'];

export function RoleBrowser() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userId, setUserId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { can } = useUser();

  const refresh = () => {
    listRoleAssignments().then(setAssignments);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!can('delete')) {
    return <p>Admin access required.</p>;
  }

  const handleSubmit = async () => {
    if (!userId || selectedRoles.length === 0) return;
    await setUserRoles(userId, selectedRoles);
    setUserId('');
    setSelectedRoles([]);
    refresh();
  };

  const handleRemove = async (uid: string) => {
    await setUserRoles(uid, []);
    refresh();
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  return (
    <div>
      <h1>Role Management</h1>
      <div style={formStyle}>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          style={inputStyle}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {availableRoles.map((role) => (
            <label key={role} style={{ fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />{' '}
              {role}
            </label>
          ))}
        </div>
        <button onClick={handleSubmit} style={addBtnStyle}>
          Set Roles
        </button>
      </div>
      {assignments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No role assignments.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Roles</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.userId}>
                <td style={tdStyle}>{a.userId}</td>
                <td style={tdStyle}>{a.roles.join(', ')}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleRemove(a.userId)}
                    style={deleteBtnStyle}
                  >
                    Remove
                  </button>
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
  alignItems: 'center',
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
