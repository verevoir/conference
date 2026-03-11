'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { AuthButton } from './AuthButton';
import styles from './AdminSidebar.module.css';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/phase', label: 'Lifecycle' },
  { href: '/admin/proposals', label: 'Proposals' },
  { href: '/admin/votes', label: 'Votes' },
  { href: '/admin/registration', label: 'Registration' },
  { href: '/admin/shop', label: 'Shop' },
  { href: '/admin/talks', label: 'Talks' },
  { href: '/admin/speakers', label: 'Speakers' },
  { href: '/admin/tracks', label: 'Tracks' },
  { href: '/admin/sponsors', label: 'Sponsors' },
  { href: '/admin/schedule', label: 'Schedule' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/highlights', label: 'Highlights' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/config', label: 'Config' },
  { href: '/admin/assets', label: 'Assets' },
  { href: '/admin/roles', label: 'Roles' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { can } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  if (!can('read')) return null;

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}
    >
      <div className={styles.brand}>
        <Link href="/" className={styles.brandLink}>
          <strong>Conference Admin</strong>
        </Link>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '\u25B6' : '\u25C0'}
        </button>
      </div>
      <div className={styles.authSection}>
        <AuthButton />
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? styles.navLinkActive : styles.navLink}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <Link href="/" className={styles.navLink}>
          View public site
        </Link>
      </div>
    </aside>
  );
}
