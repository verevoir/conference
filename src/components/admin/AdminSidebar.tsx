'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { AuthButton } from './AuthButton';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
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

  if (!can('read')) return null;

  return (
    <aside style={sidebarStyle}>
      <div
        style={{
          padding: 'var(--space-md)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <strong>Conference Admin</strong>
        </Link>
      </div>
      <div style={{ padding: 'var(--space-sm)' }}>
        <AuthButton />
      </div>
      <nav style={{ flex: 1, padding: 'var(--space-sm)' }}>
        {navItems.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...linkStyle,
                background: active ? 'var(--color-primary-light)' : undefined,
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div
        style={{
          padding: 'var(--space-sm)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" style={linkStyle}>
          View public site
        </Link>
      </div>
    </aside>
  );
}

const sidebarStyle: React.CSSProperties = {
  width: 220,
  borderRight: '1px solid var(--color-border)',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--color-surface)',
  minHeight: '100vh',
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '6px 12px',
  borderRadius: 4,
  textDecoration: 'none',
  color: 'inherit',
  fontSize: '0.875rem',
};
