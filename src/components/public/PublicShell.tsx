'use client';

import { UserProvider } from '@/context/UserContext';
import { Header } from './Header';
import { Footer } from './Footer';

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <Header />
      <main style={mainStyle}>{children}</main>
      <Footer />
    </UserProvider>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: 'var(--space-xl) var(--space-lg)',
  minHeight: 'calc(100vh - 200px)',
};
