import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getSiteSettingsFromDb } from '@/lib/siteSettings';
import { getSiteAsset } from '@/lib/siteAssets';

export const dynamic = 'force-dynamic';

function mimeFromPath(path: string): string {
  const ext = path.split('?')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'ico':
      return 'image/x-icon';
    default:
      return 'image/x-icon';
  }
}

async function readPublicFile(relPath: string) {
  const clean = relPath.split('?')[0].replace(/^\/+/, '');
  const full = join(process.cwd(), 'public', clean);
  if (!existsSync(full)) return null;
  return readFile(full);
}

export async function GET(request: NextRequest) {
  try {
    const settings = await getSiteSettingsFromDb(['favicon_path']);
    const faviconPath = settings.favicon_path || '';

    // DB-backed asset
    if (faviconPath.includes('/api/site-assets/favicon')) {
      const asset = await getSiteAsset('favicon');
      if (asset) {
        return new NextResponse(asset.data, {
          headers: {
            'Content-Type': asset.mime_type,
            'Cache-Control': 'public, max-age=3600, must-revalidate',
          },
        });
      }
    }

    // Filesystem path from settings (e.g. /images/favicon-....png)
    if (faviconPath.startsWith('/') && !faviconPath.startsWith('/api/')) {
      const buf = await readPublicFile(faviconPath);
      if (buf) {
        return new NextResponse(buf, {
          headers: {
            'Content-Type': mimeFromPath(faviconPath),
            'Cache-Control': 'public, max-age=3600, must-revalidate',
          },
        });
      }
    }

    // Fallbacks in public/
    for (const fallback of ['favicon.svg', 'favicon-default.ico', 'favicon.ico']) {
      const buf = await readPublicFile(fallback);
      if (buf) {
        return new NextResponse(buf, {
          headers: {
            'Content-Type': mimeFromPath(fallback),
            'Cache-Control': 'public, max-age=3600, must-revalidate',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Favicon not found' }, { status: 404 });
  } catch (error) {
    console.error('Error serving site favicon:', error);
    return NextResponse.json({ error: 'Failed to serve favicon' }, { status: 500 });
  }
}
