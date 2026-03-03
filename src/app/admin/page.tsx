'use client';

import { useEffect, useState } from 'react';
import { listDocuments } from '@/actions/documents';
import Link from 'next/link';

const sections = [
  { type: 'talk', label: 'Talks', href: '/admin/talks' },
  { type: 'speaker', label: 'Speakers', href: '/admin/speakers' },
  { type: 'track', label: 'Tracks', href: '/admin/tracks' },
  { type: 'sponsor', label: 'Sponsors', href: '/admin/sponsors' },
  { type: 'schedule-slot', label: 'Schedule Slots', href: '/admin/schedule' },
  { type: 'post', label: 'Blog Posts', href: '/admin/blog' },
  { type: 'page', label: 'Pages', href: '/admin/pages' },
  { type: 'organiser', label: 'Team Members', href: '/admin/team' },
  { type: 'highlight', label: 'Highlights', href: '/admin/highlights' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    sections.forEach(({ type }) => {
      listDocuments(type).then((docs) => {
        setCounts((prev) => ({ ...prev, [type]: docs.length }));
      });
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={gridStyle}>
        {sections.map(({ type, label, href }) => (
          <Link key={type} href={href} style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              {counts[type] ?? '-'}
            </div>
            <div
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              {label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 'var(--space-md)',
};

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  textDecoration: 'none',
  color: 'inherit',
  textAlign: 'center',
};
