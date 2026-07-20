import { Metadata } from 'next';
import ContactInquiryDetail from './ContactInquiryDetail';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Inquiry Details | Admin Dashboard',
  description: 'View and manage contact inquiry',
};

export default function AdminContactInquiryPage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
      <ContactInquiryDetail inquiryId={params.id} />
    </div>
  );
}

