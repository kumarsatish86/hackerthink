import { ReactNode } from 'react';
import ForumNavigation from '@/components/forum/ForumNavigation';

export default function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ForumNavigation />
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        {children}
      </main>
    </div>
  );
}

