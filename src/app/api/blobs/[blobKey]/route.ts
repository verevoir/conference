import { NextRequest, NextResponse } from 'next/server';
import { getBlobData } from '@/actions/assets';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ blobKey: string }> },
) {
  const { blobKey } = await params;
  const data = await getBlobData(decodeURIComponent(blobKey));
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(data.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
