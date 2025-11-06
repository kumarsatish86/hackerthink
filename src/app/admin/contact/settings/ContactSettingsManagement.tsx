import { Metadata } from 'next';
import ContactSettingsManagement from './ContactSettingsManagement';

export const metadata: Metadata = {
  title: 'Contact Settings | Admin Dashboard',
  description: 'Configure contact module settings',
};

export default function AdminContactSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ContactSettingsManagement />
    </div>
  );
}

