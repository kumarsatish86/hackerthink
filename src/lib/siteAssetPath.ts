/**
 * Convert stored logo/favicon paths to URLs that work at runtime on VPS
 * (next start / standalone), where files written under public/images are
 * not always served as static assets.
 */
export function toServableSiteAssetPath(path: string | null | undefined): string {
  if (!path) return '';

  const [clean, query] = path.split('?');
  const suffix = query ? `?${query}` : '';

  if (
    clean.startsWith('/api/site-assets/') ||
    clean.startsWith('/api/site-images/') ||
    clean.startsWith('/api/uploads/') ||
    clean.startsWith('/api/site-favicon') ||
    clean.startsWith('http://') ||
    clean.startsWith('https://')
  ) {
    return path;
  }

  if (clean.startsWith('/images/')) {
    return `/api/site-images/${clean.slice('/images/'.length)}${suffix}`;
  }

  return path;
}

/** Disk-relative path under public/ for a stored or API site image URL. */
export function siteAssetDiskRelativePath(path: string | null | undefined): string | null {
  if (!path) return null;
  const clean = path.split('?')[0];

  if (clean.startsWith('/api/site-images/')) {
    return `images/${clean.slice('/api/site-images/'.length)}`;
  }
  if (clean.startsWith('/images/')) {
    return clean.replace(/^\/+/, '');
  }
  return null;
}
