'use client';

import { UserProvider } from '@/context/UserContext';
import { AdminSidebar } from './AdminSidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div style={layoutStyle}>
        <AdminSidebar />
        <main style={mainStyle}>{children}</main>
      </div>
    </UserProvider>
  );
}

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-xl)',
  maxWidth: 960,
};
