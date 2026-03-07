'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  listAssets,
  uploadAsset,
  deleteAsset,
  updateAssetTags,
  updateAssetAttribution,
  updateAssetAlt,
} from '@/actions/assets';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import styles from './AssetBrowser.module.css';

type TypeFilter = 'all' | 'image' | 'video';

function getAssetTags(asset: SerializedDocument): string[] {
  const tags = asset.data.tags;
  return Array.isArray(tags) ? (tags as string[]) : [];
}

export function AssetBrowser() {
  const [assets, setAssets] = useState<SerializedDocument[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { identity, can } = useUser();

  const refresh = () => {
    listAssets().then(setAssets);
  };

  useEffect(() => {
    refresh();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const a of assets) {
      for (const t of getAssetTags(a)) set.add(t);
    }
    return Array.from(set).sort();
  }, [assets]);

  const filtered = useMemo(() => {
    let result = assets;
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.data.type === typeFilter);
    }
    if (tagFilter) {
      result = result.filter((a) => getAssetTags(a).includes(tagFilter));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((a) =>
        String(a.data.filename).toLowerCase().includes(q),
      );
    }
    return result;
  }, [assets, search, typeFilter, tagFilter]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('createdBy', identity.id);
    await uploadAsset(fd);
    refresh();
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await deleteAsset(id);
    refresh();
  };

  const handleAddTag = async (asset: SerializedDocument) => {
    const tag = prompt('Enter tag:');
    if (!tag?.trim()) return;
    const current = getAssetTags(asset);
    const normalized = tag.trim().toLowerCase();
    if (current.includes(normalized)) return;
    await updateAssetTags(asset.id, [...current, normalized]);
    refresh();
  };

  const handleRemoveTag = async (asset: SerializedDocument, tag: string) => {
    const current = getAssetTags(asset);
    await updateAssetTags(
      asset.id,
      current.filter((t) => t !== tag),
    );
    refresh();
  };

  const handleEditAlt = async (asset: SerializedDocument) => {
    const current = (asset.data.alt as string) || '';
    const value = prompt('Alt text:', current);
    if (value === null) return;
    await updateAssetAlt(asset.id, value || null);
    refresh();
  };

  const handleEditAttribution = async (asset: SerializedDocument) => {
    const current = (asset.data.attribution as string) || '';
    const value = prompt('Attribution (credit / copyright):', current);
    if (value === null) return;
    await updateAssetAttribution(asset.id, value || null);
    refresh();
  };

  const blobUrl = (asset: SerializedDocument) =>
    `/api/blobs/${encodeURIComponent(String(asset.data.blobKey))}`;

  return (
    <div>
      <h1>Assets</h1>
      <div className={styles.controls}>
        {can('create') && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              accept="image/*,video/*"
              className={styles.uploadInput}
            />
            <button
              className={btn.primary}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </button>
          </>
        )}
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={form.input}
        />
        <div className={styles.filterGroup}>
          {(['all', 'image', 'video'] as TypeFilter[]).map((t) => (
            <button
              key={t}
              className={typeFilter === t ? btn.primary : btn.outline}
              onClick={() => setTypeFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== 'all' &&
                ` (${assets.filter((a) => a.data.type === t).length})`}
            </button>
          ))}
        </div>
      </div>
      {allTags.length > 0 && (
        <div className={styles.tagBar}>
          <button
            className={tagFilter === null ? btn.primary : btn.outline}
            onClick={() => setTagFilter(null)}
          >
            All tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={tagFilter === tag ? btn.primary : btn.outline}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {filtered.length === 0 ? (
        <p className={styles.empty}>
          {assets.length === 0 ? 'No assets uploaded.' : 'No matching assets.'}
        </p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((a) => (
            <div key={a.id} className={styles.card}>
              <div className={styles.preview}>
                {a.data.type === 'image' ? (
                  <img
                    src={blobUrl(a)}
                    alt={String(a.data.alt || a.data.filename)}
                    className={styles.thumbnail}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <span className={styles.videoIcon}>&#9654;</span>
                  </div>
                )}
              </div>
              <div className={styles.info}>
                <span
                  className={styles.filename}
                  title={String(a.data.filename)}
                >
                  {String(a.data.filename)}
                </span>
                <span className={styles.meta}>
                  {String(a.data.type)}
                  {a.data.width && a.data.height
                    ? ` \u00b7 ${a.data.width}\u00d7${a.data.height}`
                    : ''}
                </span>
                {can('update') && (
                  <button
                    className={styles.attribution}
                    onClick={() => handleEditAlt(a)}
                    title="Edit alt text"
                  >
                    {a.data.alt ? String(a.data.alt) : '+ alt text'}
                  </button>
                )}
                {can('update') && (
                  <button
                    className={styles.attribution}
                    onClick={() => handleEditAttribution(a)}
                    title="Edit attribution"
                  >
                    {a.data.attribution
                      ? String(a.data.attribution)
                      : '+ attribution'}
                  </button>
                )}
                {!can('update') && Boolean(a.data.attribution) && (
                  <span className={styles.attribution}>
                    {String(a.data.attribution)}
                  </span>
                )}
                <div className={styles.tags}>
                  {getAssetTags(a).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      {can('update') && (
                        <button
                          className={styles.tagRemove}
                          onClick={() => handleRemoveTag(a, tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                  {can('update') && (
                    <button
                      className={styles.addTag}
                      onClick={() => handleAddTag(a)}
                    >
                      + tag
                    </button>
                  )}
                </div>
              </div>
              {can('delete') && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className={`${btn.danger} ${styles.deleteBtn}`}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
