import type { ComponentType } from 'react';

/**
 * A content control — a self-contained unit of content with its own
 * schema (for editing) and renderer (for display).
 *
 * Controls are not documents. They are stored inline as items in a
 * page's `content` array: `{ type: string, ...controlData }`.
 */
export interface ContentControl {
  /** Unique type discriminator stored with each content block */
  type: string;
  /** Human-readable label for the block picker */
  label: string;
  /** Schema block — used by BlockEditor for field editing and validation */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  block: any;
  /** React component that renders the control's data on the public site */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Renderer: ComponentType<{ data: any }>;
}

/** A stored content block — type discriminator + control-specific data */
export interface ContentBlock {
  type: string;
  [key: string]: unknown;
}
