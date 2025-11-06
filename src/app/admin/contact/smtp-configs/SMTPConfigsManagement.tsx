import { Metadata } from 'next';
import SMTPConfigsManagement from './SMTPConfigsManagement';

export const metadata: Metadata = {
  title: 'SMTP Configurations | Admin Dashboard',
  description: 'Manage SMTP email configurations',
};

export default function AdminSMTPConfigsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <SMTPConfigsManagement />
    </div>
  );
}

