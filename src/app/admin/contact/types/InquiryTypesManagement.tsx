import { Metadata } from 'next';
import InquiryTypesManagement from './InquiryTypesManagement';

export const metadata: Metadata = {
  title: 'Inquiry Types Management | Admin Dashboard',
  description: 'Manage contact inquiry types',
};

export default function AdminInquiryTypesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <InquiryTypesManagement />
    </div>
  );
}

