import { NextRequest, NextResponse } from 'next/server';
import { getSiteAsset, type SiteAssetKey } from '@/lib/siteAssets';

export const dynamic = 'force-dynamic';

const ALLOWED: SiteAssetKey[] = ['logo', 'favicon', 'footer_logo'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    if (!ALLOWED.includes(key as SiteAssetKey)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const asset = await getSiteAsset(key as SiteAssetKey);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const etag = `"${key}-${new Date(asset.updated_at).getTime()}"`;
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(asset.data, {
      status: 200,
      headers: {
        'Content-Type': asset.mime_type,
        'Content-Length': String(asset.data.length),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        ETag: etag,
      },
    });
  } catch (error) {
    console.error('Error serving site asset:', error);
    return NextResponse.json({ error: 'Failed to serve asset' }, { status: 500 });
  }
}
