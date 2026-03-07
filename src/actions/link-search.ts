'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireOrganiser } from '@/server/require-organiser';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

export interface LinkSearchHit {
  id: string;
  url: string;
  title: string;
  blockType: string;
}

/**
 * Search linkable documents across block types.
 * Matches against title/name and slug fields (case-insensitive substring).
 * Returns up to 10 results.
 */
export async function searchLinkableDocuments(
  query: string,
): Promise<LinkSearchHit[]> {
  await requireOrganiser(await getToken());
  const q = query.trim();
  if (!q) return [];

  const db = await ensureDb();
  const hits: LinkSearchHit[] = [];
  const seen = new Set<string>();

  const add = (id: string, url: string, title: string, blockType: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    hits.push({ id, url, title, blockType });
  };

  // Search talks by title
  const talks = await db.list('talk', {
    where: { title: { $contains: q } },
    limit: 5,
  });
  for (const d of talks) {
    add(d.id, `/talks/${d.id}`, String(d.data.title), 'talk');
  }

  // Search speakers by name
  const speakers = await db.list('speaker', {
    where: { name: { $contains: q } },
    limit: 5,
  });
  for (const d of speakers) {
    add(d.id, `/speakers/${d.id}`, String(d.data.name), 'speaker');
  }

  // Search posts by title
  const postsByTitle = await db.list('post', {
    where: { title: { $contains: q } },
    limit: 5,
  });
  for (const d of postsByTitle) {
    add(d.id, `/blog/${String(d.data.slug)}`, String(d.data.title), 'post');
  }

  // Search posts by slug
  const postsBySlug = await db.list('post', {
    where: { slug: { $contains: q } },
    limit: 5,
  });
  for (const d of postsBySlug) {
    add(d.id, `/blog/${String(d.data.slug)}`, String(d.data.title), 'post');
  }

  // Search pages by title
  const pagesByTitle = await db.list('page', {
    where: { title: { $contains: q } },
    limit: 5,
  });
  for (const d of pagesByTitle) {
    add(d.id, `/${String(d.data.slug)}`, String(d.data.title), 'page');
  }

  // Search pages by slug
  const pagesBySlug = await db.list('page', {
    where: { slug: { $contains: q } },
    limit: 5,
  });
  for (const d of pagesBySlug) {
    add(d.id, `/${String(d.data.slug)}`, String(d.data.title), 'page');
  }

  return hits.slice(0, 10);
}
