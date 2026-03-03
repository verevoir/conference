// Next.js Server Actions cannot return class instances or Dates directly.
// This helper serializes documents for client consumption.

export interface SerializedDocument {
  id: string;
  blockType: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function serializeDocument(doc: {
  id: string;
  blockType: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}): SerializedDocument {
  return {
    id: doc.id,
    blockType: doc.blockType,
    data: doc.data as Record<string, unknown>,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeDocuments(
  docs: Array<{
    id: string;
    blockType: string;
    data: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  }>,
): SerializedDocument[] {
  return docs.map(serializeDocument);
}
