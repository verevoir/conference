'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listRoleAssignments, setUserRoles } from '@/actions/roles';
import btn from '@/styles/Button.module.css';
import table from '@/styles/Table.module.css';
import form from '@/styles/Form.module.css';
import styles from './RoleBrowser.module.css';

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
      <div className={form.formRow}>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className={form.input}
        />
        <div className={styles.roleCheckboxes}>
          {availableRoles.map((role) => (
            <label key={role} className={form.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />{' '}
              {role}
            </label>
          ))}
        </div>
        <button onClick={handleSubmit} className={btn.primary}>
          Set Roles
        </button>
      </div>
      {assignments.length === 0 ? (
        <p className={styles.empty}>No role assignments.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>User ID</th>
                <th className={table.th}>Roles</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.userId} className={table.tr}>
                  <td className={table.td}>{a.userId}</td>
                  <td className={table.td}>{a.roles.join(', ')}</td>
                  <td className={table.td}>
                    <button
                      onClick={() => handleRemove(a.userId)}
                      className={btn.danger}
                    >
                      Remove
                    </button>
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
