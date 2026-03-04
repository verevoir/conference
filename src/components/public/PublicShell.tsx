'use client';

import { UserProvider } from '@/context/UserContext';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './PublicShell.module.css';

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </UserProvider>
  );
}
