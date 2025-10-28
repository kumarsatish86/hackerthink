// Mark the admin routes as dynamic
export const dynamic = 'force-dynamic';

// This is a simple layout wrapper that doesn't add any UI
// It just makes sure the dynamic export is applied to admin routes
export default function DynamicAdminLayout({ children }) {
  return children;
} 