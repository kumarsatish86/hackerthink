import { Metadata } from 'next';
import InquiryTypesManagement from './InquiryTypesManagement';

export const metadata: Metadata = {
  title: 'Inquiry Types Management | Admin Dashboard',
  description: 'Manage contact inquiry types',
};

export default function AdminInquiryTypesPage() {
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
      <InquiryTypesManagement />
    </div>
  );
}

