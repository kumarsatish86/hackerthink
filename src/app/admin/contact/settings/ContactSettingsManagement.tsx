import { Metadata } from 'next';
import ContactSettingsManagement from './ContactSettingsManagement';

export const metadata: Metadata = {
  title: 'Contact Settings | Admin Dashboard',
  description: 'Configure contact module settings',
};

export default function AdminContactSettingsPage() {
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
      <ContactSettingsManagement />
    </div>
  );
}

