import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

import { authOptions } from '@/app/api/auth/authOptions';
import ForumAdminDashboard from '@/components/admin/forum/ForumAdminDashboard';

export const metadata: Metadata = {
  title: 'Forum Administration - Admin',
  description: 'Manage forum categories, moderation, and users',
};

export default async function ForumAdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return <ForumAdminDashboard />;
}

