'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

const toc = [
  { label: 'Information Collection', index: 0, id: 'information-collection' },
  { label: 'Information Use', index: 1, id: 'information-use' },
  { label: 'Information Sharing', index: 2, id: 'information-sharing' },
  { label: 'Cookies & Tracking', index: 3, id: 'cookies-tracking' },
  { label: 'User Rights', index: 4, id: 'user-rights' },
  { label: 'Policy Changes', index: 5, id: 'policy-changes' },
  { label: 'Contact Us', index: 6, id: 'contact-us' },
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Smooth scroll to section when link is clicked
  useEffect(() => {
    const handleHashChange = () => {
      const id = window.location.hash.replace('#', '');
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

        {/* Privacy Policy Content */}
        <section className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-extrabold mb-4 text-indigo-700">Privacy Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Information Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 0 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 0 ? 'ring-2 ring-indigo-400' : ''}`}
              id="information-collection"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Information We Collect</h2>
              <div className="text-gray-700 space-y-4">
                <p>At LinuxConcept, we collect information to provide and improve our services. The types of information we collect include:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
                  <li><strong>Profile Information:</strong> Information you provide in your user profile, including profile picture, biography, and professional details.</li>
                  <li><strong>Course Progress:</strong> Information about courses you've taken, progress, quiz results, and certificates earned.</li>
                  <li><strong>Usage Information:</strong> How you interact with our platform, including pages visited, features used, and time spent.</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies.</li>
                </ul>
              </div>
            </motion.div>

            {/* Information Use */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 1 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 1 ? 'ring-2 ring-indigo-400' : ''}`}
              id="information-use"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">How We Use Your Information</h2>
              <div className="text-gray-700 space-y-4">
                <p>We use the collected information for various purposes, including:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Providing and personalizing our educational services</li>
                  <li>Processing transactions and managing your account</li>
                  <li>Tracking your progress and issuing certificates</li>
                  <li>Improving our platform and developing new features</li>
                  <li>Communicating with you about updates, promotions, and new courses</li>
                  <li>Analyzing usage patterns to enhance user experience</li>
                  <li>Preventing fraudulent activity and ensuring platform security</li>
                </ul>
              </div>
            </motion.div>

            {/* Information Sharing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 2 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 2 ? 'ring-2 ring-indigo-400' : ''}`}
              id="information-sharing"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Information Sharing</h2>
              <div className="text-gray-700 space-y-4">
                <p>We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist us in operating our platform and serving you.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights or the safety of others.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred as a business asset.</li>
                  <li><strong>With Your Consent:</strong> We may share your information in other circumstances with your explicit consent.</li>
                </ul>
              </div>
            </motion.div>

            {/* Cookies and Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 3 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 3 ? 'ring-2 ring-indigo-400' : ''}`}
              id="cookies-tracking"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Cookies and Tracking Technologies</h2>
              <div className="text-gray-700 space-y-4">
                <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.</p>
                <p>These technologies are used for:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Keeping you signed in to your account</li>
                  <li>Understanding how you use our platform</li>
                  <li>Remembering your preferences</li>
                  <li>Improving the overall user experience</li>
                  <li>Personalizing content and recommendations</li>
                </ul>
              </div>
            </motion.div>

            {/* User Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 4 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 4 ? 'ring-2 ring-indigo-400' : ''}`}
              id="user-rights"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Your Rights</h2>
              <div className="text-gray-700 space-y-4">
                <p>You have several rights regarding your personal information:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Access and Update:</strong> You can access and update most of your personal information through your account settings.</li>
                  <li><strong>Data Portability:</strong> You can request a copy of your personal data in a structured, commonly used format.</li>
                  <li><strong>Deletion:</strong> You can request that we delete your personal information, subject to certain exceptions.</li>
                  <li><strong>Restriction:</strong> You can request that we restrict the processing of your personal information.</li>
                  <li><strong>Objection:</strong> You can object to our processing of your personal information in certain circumstances.</li>
                </ul>
              </div>
            </motion.div>

            {/* Policy Changes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 5 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 5 ? 'ring-2 ring-indigo-400' : ''}`}
              id="policy-changes"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Changes to This Policy</h2>
              <div className="text-gray-700 space-y-4">
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
                <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
              </div>
            </motion.div>

            {/* Contact Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active === 6 ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === 6 ? 'ring-2 ring-indigo-400' : ''}`}
              id="contact-us"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Contact Us</h2>
              <div className="text-gray-700 space-y-4">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>By email:</strong> <a href="mailto:privacy@ainews.com" className="text-indigo-600 hover:text-indigo-800 transition-colors">privacy@ainews.com</a></li>
                  <li><strong>By mail:</strong> LinuxConcept Privacy Team, 123 Tech Street, San Francisco, CA 94107</li>
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
          </motion.div>
        </section>
      </div>
      
      {/* CTA Section */}
      <div className="bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold mb-6"
            >
              Have More Questions?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-indigo-200 mb-8 max-w-3xl mx-auto"
            >
              If you have any questions about our privacy practices or how we handle your data, we're here to help.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/contact" className="inline-block bg-white text-indigo-900 font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Contact Our Support Team
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 