'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { AuthButton } from '@/components/admin/AuthButton';
import styles from './Header.module.css';

const navLinks = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/blog', label: 'Blog' },
  { href: '/team', label: 'Team' },
  { href: '/highlights', label: 'Highlights' },
];

export function Header() {
  const { isAuthenticated, can } = useUser();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Conference
        </Link>
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/my-schedule" className={styles.navLink}>
              My Schedule
            </Link>
          )}
        </nav>
        <div className={styles.actions}>
          <AuthButton />
          {can('create') && (
            <Link href="/admin" className={styles.adminLink}>
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
