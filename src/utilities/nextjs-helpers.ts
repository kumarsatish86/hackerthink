/**
 * Helper function to safely access params in Next.js API and page routes
 * This handles the transition to params becoming a Promise in Next.js 14+
 * 
 * @param params The params object from Next.js route
 * @returns The unwrapped params object
 */
export async function unwrapParams<T>(params: T): Promise<T> {
  // In Next.js 13, params is a regular object
  // In Next.js 14+, params is a Promise that needs to be awaited
  if (params instanceof Promise) {
    return await params;
  }
  return params;
} 