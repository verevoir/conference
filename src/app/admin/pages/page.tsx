'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import table from '@/styles/Table.module.css';
import styles from './page.module.css';

interface PageGroup {
  slug: string;
  versions: SerializedDocument[];
  latest: SerializedDocument;
  published: SerializedDocument | undefined;
}

function groupBySlug(docs: SerializedDocument[]): PageGroup[] {
  const map = new Map<string, SerializedDocument[]>();
  for (const doc of docs) {
    const slug = String(doc.data.slug || '');
    if (!map.has(slug)) map.set(slug, []);
    map.get(slug)!.push(doc);
  }
  const groups: PageGroup[] = [];
  for (const [slug, versions] of map) {
    versions.sort(
      (a, b) =>
        ((b.data.version as number) || 1) - ((a.data.version as number) || 1),
    );
    groups.push({
      slug,
      versions,
      latest: versions[0],
      published: versions.find((v) => v.data.status === 'published'),
    });
  }
  return groups.sort((a, b) => a.slug.localeCompare(b.slug));
}

export default function PagesPage() {
  const [docs, setDocs] = useState<SerializedDocument[]>([]);
  const { can } = useUser();

  useEffect(() => {
    listDocuments('page').then(setDocs);
  }, []);

  const groups = groupBySlug(docs);

  return (
    <div>
      <div className={styles.header}>
        <h1>Pages</h1>
        {can('create') && (
          <Link href="/admin/pages/new" className={btn.primary}>
            New Page
          </Link>
        )}
      </div>
      {groups.length === 0 ? (
        <p className={styles.empty}>No pages yet.</p>
      ) : (
        <div className={table.tableWrapper}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Title</th>
                <th className={table.th}>Slug</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Versions</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.slug} className={table.tr}>
                  <td className={table.td}>
                    {String(g.latest.data.title || g.slug)}
                  </td>
                  <td className={table.td}>/{g.slug}</td>
                  <td className={table.td}>
                    {g.published ? (
                      <span className={styles.published}>published</span>
                    ) : (
                      <span className={styles.draft}>
                        {String(g.latest.data.status || 'draft')}
                      </span>
                    )}
                  </td>
                  <td className={table.td}>{g.versions.length}</td>
                  <td className={table.td}>
                    <Link
                      href={`/admin/pages/${g.latest.id}`}
                      className={styles.actionLink}
                    >
                      Edit latest (v{String(g.latest.data.version || 1)})
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
