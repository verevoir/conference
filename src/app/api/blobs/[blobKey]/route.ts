import { NextRequest, NextResponse } from 'next/server';
import { getBlobData } from '@/actions/assets';
import { logger } from '@/server/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ blobKey: string }> },
) {
  const { blobKey } = await params;
  const decodedKey = decodeURIComponent(blobKey);
  const data = await getBlobData(decodedKey);
  if (!data) {
    logger.warn('Blob not found', { action: 'getBlob', blobKey: decodedKey });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(data.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
