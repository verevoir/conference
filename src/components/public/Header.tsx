'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { AuthButton } from '@/components/admin/AuthButton';

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
    <header style={headerStyle}>
      <div style={innerStyle}>
        <Link href="/" style={logoStyle}>
          Conference
        </Link>
        <nav style={navStyle}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={linkStyle}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/my-schedule" style={linkStyle}>
              My Schedule
            </Link>
          )}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AuthButton />
          {can('create') && (
            <Link href="/admin" style={adminLink}>
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
  background: '#fff',
};

const innerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 var(--space-lg)',
  display: 'flex',
  alignItems: 'center',
  height: 64,
  gap: 'var(--space-lg)',
};

const logoStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '1.25rem',
  textDecoration: 'none',
  color: 'inherit',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-md)',
  flex: 1,
};

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'var(--color-text)',
  fontSize: '0.875rem',
};

const adminLink: React.CSSProperties = {
  textDecoration: 'none',
  color: 'var(--color-text-muted)',
  fontSize: '0.75rem',
};
