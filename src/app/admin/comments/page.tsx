import { Metadata } from 'next';
import AdminCommentsManagement from './AdminCommentsManagement';

export const metadata: Metadata = {
  title: 'Comments Management | Admin Dashboard',
  description: 'Manage user comments',
};

export default function AdminCommentsPage() {
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
      <h1 className="text-3xl font-bold mb-6">Comments Management</h1>
      <AdminCommentsManagement />
    </div>
  );
} 