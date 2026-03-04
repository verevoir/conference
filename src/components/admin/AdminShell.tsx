'use client';

import { UserProvider } from '@/context/UserContext';
import { AdminSidebar } from './AdminSidebar';
import styles from './AdminShell.module.css';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className={styles.layout}>
        <AdminSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </UserProvider>
  );
}
