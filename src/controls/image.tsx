'use client';

import { useState } from 'react';
import { defineBlock, text } from '@verevoir/schema';
import { AssetPickerModal } from '@/components/admin/AssetPickerModal';
import type { SerializedDocument } from '@/lib/serialization';
import type { ContentControl } from './types';
import btn from '@/styles/Button.module.css';

const block = defineBlock({
  name: 'content-image',
  fields: {
    caption: text('Caption').optional(),
  },
});

function Renderer({
  data,
}: {
  data: { assetId?: string; blobKey?: string; caption?: string };
}) {
  if (!data.blobKey) return null;
  return (
    <figure>
      <img
        src={`/api/blobs/${encodeURIComponent(data.blobKey)}`}
        alt={data.caption || ''}
      />
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  );
}

export function ImageBlockEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const [picking, setPicking] = useState(false);

  const handleSelect = (asset: SerializedDocument) => {
    onChange({
      ...data,
      assetId: asset.id,
      blobKey: String(asset.data.blobKey),
      filename: String(asset.data.filename),
    });
    setPicking(false);
  };

  const blobKey = data.blobKey as string | undefined;
  const filename = data.filename as string | undefined;

  return (
    <div>
      {blobKey ? (
        <div style={{ marginBottom: 'var(--space-sm)' }}>
          <img
            src={`/api/blobs/${encodeURIComponent(blobKey)}`}
            alt={filename || ''}
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              borderRadius: 'var(--radius-md)',
            }}
          />
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 4,
            }}
          >
            {filename}
          </div>
        </div>
      ) : (
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}
        >
          No image selected.
        </p>
      )}
      <button className={btn.outline} onClick={() => setPicking(true)}>
        {blobKey ? 'Change Image' : 'Choose Image'}
      </button>
      {picking && (
        <AssetPickerModal
          onSelect={handleSelect}
          onClose={() => setPicking(false)}
          typeFilter="image"
        />
      )}
    </div>
  );
}

export const image: ContentControl = {
  type: 'image',
  label: 'Image',
  block,
  Renderer,
};
