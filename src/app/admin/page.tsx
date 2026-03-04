'use client';

import { useEffect, useState } from 'react';
import { listDocuments } from '@/actions/documents';
import Link from 'next/link';
import styles from './page.module.css';

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
      <div className={styles.grid}>
        {sections.map(({ type, label, href }) => (
          <Link key={type} href={href} className={styles.card}>
            <div className={styles.count}>{counts[type] ?? '-'}</div>
            <div className={styles.label}>{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
