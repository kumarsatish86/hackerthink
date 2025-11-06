import { Metadata } from 'next';
import ContactInquiryDetail from './ContactInquiryDetail';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Inquiry Details | Admin Dashboard',
  description: 'View and manage contact inquiry',
};

export default function AdminContactInquiryPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <ContactInquiryDetail inquiryId={params.id} />
    </div>
  );
}

