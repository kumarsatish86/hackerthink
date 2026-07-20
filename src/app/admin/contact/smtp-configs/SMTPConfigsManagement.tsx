import { Metadata } from 'next';
import SMTPConfigsManagement from './SMTPConfigsManagement';

export const metadata: Metadata = {
  title: 'SMTP Configurations | Admin Dashboard',
  description: 'Manage SMTP email configurations',
};

export default function AdminSMTPConfigsPage() {
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
      <SMTPConfigsManagement />
    </div>
  );
}

