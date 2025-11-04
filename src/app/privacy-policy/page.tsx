'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaEye, FaShare, FaCookie, FaUserShield, FaFileAlt, FaEnvelope } from 'react-icons/fa';

const toc = [
  { label: 'Information Collection', index: 0, id: 'information-collection', icon: FaEye },
  { label: 'Information Use', index: 1, id: 'information-use', icon: FaFileAlt },
  { label: 'Information Sharing', index: 2, id: 'information-sharing', icon: FaShare },
  { label: 'Cookies & Tracking', index: 3, id: 'cookies-tracking', icon: FaCookie },
  { label: 'User Rights', index: 4, id: 'user-rights', icon: FaUserShield },
  { label: 'Data Security', index: 5, id: 'data-security', icon: FaShieldAlt },
  { label: 'Contact Us', index: 6, id: 'contact-us', icon: FaEnvelope },
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = toc.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section, index) => {
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActive(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSidebarClick = (idx: number, id: string) => {
    setActive(idx);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaShieldAlt className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/4 mb-8 lg:mb-0 sticky top-32 self-start">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaFileAlt className="w-5 h-5 mr-2 text-red-600" />
                Contents
              </h2>
              <ul className="space-y-2">
                {toc.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center ${
                          active === idx
                            ? 'bg-red-50 text-red-700 font-semibold border-l-4 border-red-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                        }`}
                        onClick={() => handleSidebarClick(item.index, item.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1">
            <div className="space-y-8">
              {/* Information Collection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                id="information-collection"
                className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaEye className="w-6 h-6 mr-2" />
                  Information We Collect
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>At HackerThink, we collect information to provide and improve our services. The types of information we collect include:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
                    <li><strong>Profile Information:</strong> Information you provide in your user profile, including profile picture, biography, and professional details.</li>
                    <li><strong>Content Preferences:</strong> Articles, news, and topics you read, favorite, or interact with.</li>
                    <li><strong>Usage Information:</strong> How you interact with our platform, including pages visited, features used, and time spent.</li>
                    <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies.</li>
                  </ul>
                </div>
              </motion.div>

              {/* Information Use */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                id="information-use"
                className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaFileAlt className="w-6 h-6 mr-2" />
                  How We Use Your Information
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>We use the collected information for various purposes, including:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>Providing and personalizing our news and content services</li>
                    <li>Recommending relevant articles based on your interests</li>
                    <li>Sending newsletters and important platform updates</li>
                    <li>Improving our platform and developing new features</li>
                    <li>Analyzing usage patterns to enhance user experience</li>
                    <li>Preventing fraudulent activity and ensuring platform security</li>
                    <li>Responding to your inquiries and providing customer support</li>
                  </ul>
                </div>
              </motion.div>

              {/* Information Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                id="information-sharing"
                className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaShare className="w-6 h-6 mr-2" />
                  Information Sharing
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:</p>
                  <ul className="list-disc ml-6 space-y-3">
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                id="cookies-tracking"
                className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaCookie className="w-6 h-6 mr-2" />
                  Cookies and Tracking Technologies
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.</p>
                  <p>These technologies are used for:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>Keeping you signed in to your account</li>
                    <li>Understanding how you use our platform</li>
                    <li>Remembering your preferences and settings</li>
                    <li>Improving the overall user experience</li>
                    <li>Personalizing content and recommendations</li>
                    <li>Analyzing traffic and usage patterns</li>
                  </ul>
                </div>
              </motion.div>

              {/* User Rights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                id="user-rights"
                className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaUserShield className="w-6 h-6 mr-2" />
                  Your Rights
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>You have several rights regarding your personal information:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li><strong>Access:</strong> You can access most of your personal information through your account settings.</li>
                    <li><strong>Update:</strong> You can update your personal information at any time.</li>
                    <li><strong>Data Portability:</strong> You can request a copy of your personal data in a structured format.</li>
                    <li><strong>Deletion:</strong> You can request that we delete your personal information, subject to certain exceptions.</li>
                    <li><strong>Opt-Out:</strong> You can unsubscribe from marketing emails at any time.</li>
                  </ul>
                </div>
              </motion.div>

              {/* Data Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                id="data-security"
                className="bg-white rounded-xl shadow-md p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaShieldAlt className="w-6 h-6 mr-2" />
                  Data Security
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                  <p>These measures include:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security audits and assessments</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Employee training on data protection</li>
                    <li>Incident response and monitoring systems</li>
                  </ul>
                </div>
              </motion.div>

              {/* Contact Us */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                id="contact-us"
                className="bg-red-50 rounded-xl shadow-md p-8 border border-red-200"
              >
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  <FaEnvelope className="w-6 h-6 mr-2" />
                  Contact Us
                </h2>
                <div className="text-gray-700 space-y-4">
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <div className="bg-white rounded-lg p-4">
                    <ul className="space-y-2">
                      <li><strong>By email:</strong> <a href="mailto:privacy@hackerthink.com" className="text-red-600 hover:text-red-700 transition-colors">privacy@hackerthink.com</a></li>
                      <li><strong>By mail:</strong> HackerThink Privacy Team, 123 Tech Street, San Francisco, CA 94107</li>
                      <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Last Updated */}
            <div className="mt-12 text-center">
              <p className="text-gray-500">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </section>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have More Questions?</h2>
          <p className="text-red-100 mb-8">
            If you have any questions about our privacy practices or how we handle your data, we're here to help.
          </p>
          <Link href="/contact" className="inline-block bg-white text-red-600 font-medium px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            Contact Our Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}
