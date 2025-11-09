/**
 * Utility function to convert image paths to use the dynamic API route.
 * This ensures images work immediately after upload without requiring a rebuild.
 * 
 * @param path - The image path (can be `/uploads/...` or `/api/uploads/...` or full URL)
 * @returns The path converted to use the API route if it's a local upload path
 */
export function getImagePath(path: string | null | undefined): string {
  if (!path) return '';
  
  // If it's already an API path or external URL, return as is
  if (path.startsWith('/api/uploads/') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Convert `/uploads/...` to `/api/uploads/...` for dynamic serving
  if (path.startsWith('/uploads/')) {
    return path.replace('/uploads/', '/api/uploads/');
  }
  
  // Return as is if it doesn't match any pattern
  return path;
}

