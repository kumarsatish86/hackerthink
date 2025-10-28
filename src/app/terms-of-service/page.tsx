'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const toc = [
  { label: 'Acceptance of Terms', index: 0, id: 'acceptance' },
  { label: 'Access & Eligibility', index: 1, id: 'access' },
  { label: 'User Accounts', index: 2, id: 'accounts' },
  { label: 'Content & IP', index: 3, id: 'content' },
  { label: 'User Conduct', index: 4, id: 'conduct' },
  { label: 'Payment Terms', index: 5, id: 'payment' },
  { label: 'Termination', index: 6, id: 'termination' },
  { label: 'Disclaimers', index: 7, id: 'disclaimers' },
  { label: 'Liability', index: 8, id: 'liability' },
  { label: 'Disputes', index: 9, id: 'disputes' },
  { label: 'Contact', index: 10, id: 'contact' },
];

export default function TermsOfService() {
  const [active, setActive] = useState(0);

  // Handler for sidebar click
  const handleSidebarClick = (idx: number, id: string) => {
    setActive(idx);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-12">
        {/* Floating Table of Contents */}
        <aside className="md:w-1/4 mb-8 md:mb-0 sticky top-28 self-start z-10">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8 md:mb-0"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contents</h2>
            <ul className="space-y-2">
              {toc.map((item, idx) => (
                <li key={item.label}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded transition-colors duration-200 ${active === item.index ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-indigo-50'}`}
                    onClick={() => handleSidebarClick(item.index, item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </aside>

        {/* Terms of Service Content */}
        <section className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-extrabold mb-4 text-indigo-700">Terms of Service</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 0 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 0 ? 'ring-2 ring-indigo-400' : ''}`}
              id="acceptance"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Acceptance of Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>By accessing or using LinuxConcept's platform, website, services, and applications (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.</p>
                <p>These Terms constitute a legally binding agreement between you and LinuxConcept regarding your use of the Services. You acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
              </div>
            </motion.div>

            {/* Access and Eligibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 1 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 1 ? 'ring-2 ring-indigo-400' : ''}`}
              id="access"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Access and Eligibility</h2>
              <div className="text-gray-700 space-y-4">
                <p>To use our Services, you must be at least 13 years old (or the minimum legal age in your jurisdiction, if higher). If you are under 18, you must have your parent or legal guardian's permission to use the Services and they must agree to these Terms on your behalf.</p>
                <p>You represent that you have the legal capacity to enter into these Terms and that the information you provide during registration is accurate and complete.</p>
                <p>We reserve the right to refuse access to the Services to anyone for any reason at any time.</p>
              </div>
            </motion.div>

            {/* User Accounts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 2 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 2 ? 'ring-2 ring-indigo-400' : ''}`}
              id="accounts"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">User Accounts</h2>
              <div className="text-gray-700 space-y-4">
                <p>To access certain features of our Services, you may need to create an account. You are responsible for:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>Restricting access to your account</li>
                  <li>All activities that occur under your account</li>
                </ul>
                <p>You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot and will not be liable for any loss or damage arising from your failure to comply with these obligations.</p>
                <p>We reserve the right to delete your account and all associated data if it remains inactive for an extended period, as defined in our Privacy Policy.</p>
              </div>
            </motion.div>

            {/* Content & Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 3 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 3 ? 'ring-2 ring-indigo-400' : ''}`}
              id="content"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Content & Intellectual Property</h2>
              <div className="text-gray-700 space-y-4">
                <p><strong>Platform Content:</strong> All content on our platform, including text, graphics, logos, icons, images, audio, video, and software, is owned by or licensed to LinuxConcept and is protected by copyright, trademark, and other intellectual property laws.</p>
                <p><strong>License to Use:</strong> We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use our Services and content for personal, non-commercial purposes.</p>
                <p><strong>User-Generated Content:</strong> By submitting content to our platform (such as comments, forum posts, or project submissions), you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content in any media. You represent that you own or have the necessary rights to the content you submit.</p>
                <p><strong>Restrictions:</strong> You may not copy, modify, distribute, sell, or lease any part of our Services or content without our explicit permission. You may not reverse engineer or attempt to extract the source code of our software.</p>
              </div>
            </motion.div>

            {/* User Conduct */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 4 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 4 ? 'ring-2 ring-indigo-400' : ''}`}
              id="conduct"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">User Conduct</h2>
              <div className="text-gray-700 space-y-4">
                <p>While using our Services, you agree not to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others, including intellectual property rights</li>
                  <li>Post or transmit content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                  <li>Attempt to gain unauthorized access to any part of the Services, other accounts, or computer systems</li>
                  <li>Use the Services for any commercial purposes without our express consent</li>
                  <li>Interfere with or disrupt the integrity or performance of the Services</li>
                  <li>Harvest or collect user information without consent</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity</li>
                </ul>
                <p>We reserve the right to remove any content and suspend or terminate accounts that violate these guidelines.</p>
              </div>
            </motion.div>

            {/* Payment Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 5 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 5 ? 'ring-2 ring-indigo-400' : ''}`}
              id="payment"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Payment Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p><strong>Fees and Billing:</strong> Some of our Services may require payment. By providing a payment method, you represent that you are authorized to use the payment method and agree to pay all fees specified for the Services you select.</p>
                <p><strong>Subscriptions:</strong> For subscription-based Services, your subscription will automatically renew until cancelled. You authorize us to charge your payment method on a recurring basis until you cancel.</p>
                <p><strong>Cancellation:</strong> You can cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.</p>
                <p><strong>Refunds:</strong> Refunds are provided in accordance with our Refund Policy, available on our website. Some purchases may be non-refundable, as specified at the time of purchase.</p>
                <p><strong>Price Changes:</strong> We reserve the right to change our prices. If we change pricing, we will provide notice of the change on our website or by email before the change takes effect.</p>
              </div>
            </motion.div>

            {/* Termination */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 6 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 6 ? 'ring-2 ring-indigo-400' : ''}`}
              id="termination"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Termination</h2>
              <div className="text-gray-700 space-y-4">
                <p><strong>By You:</strong> You may terminate these Terms at any time by ceasing all use of our Services and closing your account.</p>
                <p><strong>By Us:</strong> We may terminate or suspend your access to all or part of the Services, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
                <p><strong>Effects of Termination:</strong> Upon termination, your right to use the Services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
              </div>
            </motion.div>

            {/* Disclaimers & Warranties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 7 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 7 ? 'ring-2 ring-indigo-400' : ''}`}
              id="disclaimers"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Disclaimers & Warranties</h2>
              <div className="text-gray-700 space-y-4">
                <p>Our Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>The Services will meet your requirements</li>
                  <li>The Services will be uninterrupted, timely, secure, or error-free</li>
                  <li>The results from using the Services will be accurate or reliable</li>
                  <li>The quality of any products, services, information, or other material obtained through the Services will meet your expectations</li>
                </ul>
                <p>No advice or information, whether oral or written, obtained from us or through our Services, creates any warranty not expressly stated in these Terms.</p>
              </div>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 8 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 8 ? 'ring-2 ring-indigo-400' : ''}`}
              id="liability"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Limitation of Liability</h2>
              <div className="text-gray-700 space-y-4">
                <p>To the maximum extent permitted by law, LinuxConcept shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Your access to or use of or inability to access or use the Services</li>
                  <li>Any conduct or content of any third party on the Services</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  <li>Any content obtained from the Services</li>
                </ul>
                <p>In no event shall our total liability to you for all claims exceed the amount you paid to us, if any, during the past twelve months.</p>
              </div>
            </motion.div>

            {/* Dispute Resolution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 9 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 9 ? 'ring-2 ring-indigo-400' : ''}`}
              id="disputes"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Dispute Resolution</h2>
              <div className="text-gray-700 space-y-4">
                <p><strong>Governing Law:</strong> These Terms shall be governed by the laws of [Jurisdiction], without regard to its conflict of law principles.</p>
                <p><strong>Informal Resolution:</strong> Before filing a claim against LinuxConcept, you agree to attempt to resolve the dispute informally by contacting us. We'll try to resolve the dispute by contacting you via email.</p>
                <p><strong>Arbitration:</strong> If a dispute cannot be resolved informally, you and LinuxConcept agree to resolve any claims related to these Terms or our Services through final and binding arbitration, except as set forth under Exceptions to Agreement to Arbitrate below.</p>
                <p><strong>Exceptions to Agreement to Arbitrate:</strong> Either party may assert claims in small claims court if qualified. Either party may seek injunctive relief in any court with jurisdiction to protect intellectual property rights.</p>
                <p><strong>No Class Actions:</strong> All claims must be brought in the parties' individual capacity, and not as a plaintiff or class member in any purported class or representative proceeding.</p>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 10 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 10 ? 'ring-2 ring-indigo-400' : ''}`}
              id="contact"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Contact Information</h2>
              <div className="text-gray-700 space-y-4">
                <p>If you have any questions about these Terms, please contact us:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>By email:</strong> <a href="mailto:legal@ainews.com" className="text-indigo-600 hover:text-indigo-800 transition-colors">legal@ainews.com</a></li>
                  <li><strong>By mail:</strong> LinuxConcept Legal Department, 123 Tech Street, San Francisco, CA 94107</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-8"
          >
            <p className="text-gray-500">Last Updated: May 28, 2023</p>
            <p className="text-gray-600 mt-4">
              By using our Services, you acknowledge that you have read and understood these Terms and agree to be bound by them.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
} 