import { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';
import { query } from '@/lib/db';
import { FaEnvelope, FaClock, FaHeadset, FaPaperPlane } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us - HackerThink',
  description: 'Get in touch with HackerThink. Send us your feedback, questions, or inquiries.',
};

async function getInquiryTypes() {
  try {
    const result = await query(
      'SELECT id, type_name, is_active FROM inquiry_types WHERE is_active = TRUE ORDER BY type_name'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching inquiry types:', error);
    return [];
  }
}

export default async function ContactPage() {
  const inquiryTypes = await getInquiryTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/25 mb-6 transform hover:scale-105 transition-transform duration-300">
            <FaPaperPlane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/10 border border-gray-100/50 p-8 md:p-12 lg:p-16 transform hover:shadow-3xl transition-all duration-500">
            <ContactForm inquiryTypes={inquiryTypes} />
          </div>
        </div>

        {/* Additional Contact Information */}
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 p-8 transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Other Ways to Reach Us</h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-red-50 transition-colors duration-300">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  General Inquiries
                </h3>
                <a 
                  href="mailto:news@hackerthink.com" 
                  className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 flex items-center gap-2 group/link"
                >
                  news@hackerthink.com
                  <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                </a>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-red-50 transition-colors duration-300">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Editorial
                </h3>
                <a 
                  href="mailto:editor@hackerthink.com" 
                  className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 flex items-center gap-2 group/link"
                >
                  editor@hackerthink.com
                  <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                </a>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 p-8 transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                <FaClock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Response Time</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              We typically respond to inquiries within <span className="font-semibold text-gray-900">24-48 hours</span> during business days. 
              For urgent matters, please use the appropriate inquiry type when submitting your message.
            </p>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-100">
              <div className="flex items-center gap-3">
                <FaHeadset className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Need immediate assistance? Select "Urgent" as your inquiry type.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
