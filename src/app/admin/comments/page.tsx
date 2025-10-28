import { Metadata } from 'next';
import AdminCommentsManagement from './AdminCommentsManagement';

export const metadata: Metadata = {
  title: 'Comments Management | Admin Dashboard',
  description: 'Manage user comments',
};

export default function AdminCommentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Comments Management</h1>
      <AdminCommentsManagement />
    </div>
  );
} 