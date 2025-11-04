import { Metadata } from 'next';
import { FaFileContract, FaUsers, FaInfoCircle, FaExclamationTriangle, FaBan, FaGavel } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Terms of Service - HackerThink',
  description: 'Terms and conditions for using HackerThink platform',
};

export default function TermsOfService() {
  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Please read these terms carefully before using our platform
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaFileContract className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Agreement to Terms</h2>
            </div>
            <p className="text-gray-700">
              By accessing and using HackerThink, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, you must not use our platform.
            </p>
          </section>

          {/* Account Registration */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaUsers className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Account Registration</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>To access certain features of our platform, you may need to register for an account. You agree to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          {/* Content Use */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaInfoCircle className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Content Use</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>HackerThink grants you a limited, non-exclusive, non-transferable license to access and use our content for personal, 
                 non-commercial purposes. You agree not to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Reproduce, distribute, or create derivative works without permission</li>
                <li>Use our content for commercial purposes without authorization</li>
                <li>Remove any copyright or proprietary notices</li>
                <li>Attempt to reverse engineer our platform</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Conduct */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaBan className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Prohibited Conduct</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Violating any applicable laws or regulations</li>
                <li>Transmitting any harmful or malicious code</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with or disrupting our platform or servers</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Posting false or misleading information</li>
              </ul>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Disclaimers</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Our platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Uninterrupted or error-free operation of our platform</li>
                <li>The accuracy, completeness, or usefulness of any information</li>
                <li>The security of information transmitted to or from our platform</li>
                <li>That our platform will meet your requirements</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaGavel className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Limitation of Liability</h2>
            </div>
            <p className="text-gray-700">
              To the maximum extent permitted by law, HackerThink shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
              or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="bg-red-50 rounded-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Your continued use of our platform after any such 
              modifications constitutes your acceptance of the modified terms.
            </p>
          </section>

          {/* Contact */}
          <section className="text-center py-8">
            <p className="text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-gray-700">Questions about these terms? Contact us at <a href="mailto:legal@hackerthink.com" className="text-red-600 hover:text-red-700">legal@hackerthink.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
