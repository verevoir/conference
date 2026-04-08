/**
 * Singleton pages — site-level content managed like page versions
 * but with a fixed slug and restricted control set.
 *
 * Singletons use the `page` block type with `_` prefix slugs.
 * They are excluded from the pages list and the public [slug] route.
 */

export interface SingletonDef {
  /** Slug with `_` prefix (e.g. '_header') */
  slug: string;
  /** Human-readable label for the admin UI */
  label: string;
  /** Allowed content control types (e.g. ['cta', 'paragraph']). All controls if omitted. */
  controls?: string[];
}

export const SINGLETONS: SingletonDef[] = [
  { slug: '_header', label: 'Header', controls: ['cta', 'paragraph'] },
  { slug: '_footer', label: 'Footer', controls: ['cta', 'paragraph'] },
];

const slugSet = new Set(SINGLETONS.map((s) => s.slug));

/** Check whether a slug belongs to a singleton */
export function isSingletonSlug(slug: string): boolean {
  return slugSet.has(slug);
}

/** Get singleton definition by slug */
export function getSingleton(slug: string): SingletonDef | undefined {
  return SINGLETONS.find((s) => s.slug === slug);
}
