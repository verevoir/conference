'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listAssets, uploadAsset } from '@/actions/assets';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import styles from './AssetPickerModal.module.css';

function getAssetTags(asset: SerializedDocument): string[] {
  const tags = asset.data.tags;
  return Array.isArray(tags) ? (tags as string[]) : [];
}

interface AssetPickerModalProps {
  onSelect: (asset: SerializedDocument) => void;
  onClose: () => void;
  typeFilter?: 'image' | 'video';
}

export function AssetPickerModal({
  onSelect,
  onClose,
  typeFilter: fixedType,
}: AssetPickerModalProps) {
  const [assets, setAssets] = useState<SerializedDocument[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { identity, can } = useUser();

  const refresh = () => {
    listAssets().then(setAssets);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const a of assets) {
      for (const t of getAssetTags(a)) set.add(t);
    }
    return Array.from(set).sort();
  }, [assets]);

  const filtered = useMemo(() => {
    let result = assets;
    if (fixedType) {
      result = result.filter((a) => a.data.type === fixedType);
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
  }, [assets, search, tagFilter, fixedType]);

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

  const blobUrl = (asset: SerializedDocument) =>
    `/api/blobs/${encodeURIComponent(String(asset.data.blobKey))}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select Asset</h2>
          <button className={btn.ghost} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.controls}>
          {can('create') && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleUpload}
                accept={fixedType === 'image' ? 'image/*' : 'image/*,video/*'}
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
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={form.input}
            autoFocus
          />
        </div>
        {allTags.length > 0 && (
          <div className={styles.tagBar}>
            <button
              className={tagFilter === null ? btn.primary : btn.outline}
              onClick={() => setTagFilter(null)}
            >
              All
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
        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>No matching assets.</p>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                className={styles.card}
                onClick={() => onSelect(a)}
              >
                <div className={styles.preview}>
                  {a.data.type === 'image' ? (
                    <img
                      src={blobUrl(a)}
                      alt={String(a.data.filename)}
                      className={styles.thumbnail}
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.videoIcon}>&#9654;</span>
                  )}
                </div>
                <span className={styles.filename}>
                  {String(a.data.filename)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
