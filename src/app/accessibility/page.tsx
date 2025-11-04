import { Metadata } from 'next';
import { FaUniversalAccess, FaKeyboard, FaEye, FaVolumeUp, FaSearch, FaHeadset } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Accessibility - HackerThink',
  description: 'Our commitment to web accessibility for all users',
};

export default function Accessibility() {
  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaUniversalAccess className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Accessibility
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Our commitment to making HackerThink accessible to everyone
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Commitment */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Our Commitment</h2>
            <p className="text-gray-700">
              HackerThink is committed to ensuring digital accessibility for people with disabilities. We are 
              continually improving the user experience for everyone and applying the relevant accessibility standards 
              to achieve these goals.
            </p>
          </section>

          {/* Standards */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaSearch className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Accessibility Standards</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards. Our efforts include:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Semantic HTML structure for screen readers</li>
                <li>Proper heading hierarchy and ARIA labels</li>
                <li>Sufficient color contrast ratios</li>
                <li>Keyboard navigation support</li>
                <li>Text alternatives for images and media</li>
                <li>Clear focus indicators</li>
                <li>Responsive design for various devices</li>
              </ul>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-6">Accessibility Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <FaKeyboard className="w-6 h-6 mr-3 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
                  <p className="text-gray-700 text-sm">All interactive elements can be accessed using only a keyboard.</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaEye className="w-6 h-6 mr-3 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Support</h3>
                  <p className="text-gray-700 text-sm">Content is structured for screen reader compatibility.</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaVolumeUp className="w-6 h-6 mr-3 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Audio Descriptions</h3>
                  <p className="text-gray-700 text-sm">Video content includes audio descriptions where appropriate.</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaUniversalAccess className="w-6 h-6 mr-3 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Customizable Text</h3>
                  <p className="text-gray-700 text-sm">Users can adjust text size using browser controls.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Help */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaHeadset className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Getting Help</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                If you have difficulty accessing any content on our platform, please contact us. We are committed 
                to providing an accessible experience for all users.
              </p>
              <div className="bg-red-50 rounded-lg p-4">
                <ul className="space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:accessibility@hackerthink.com" className="text-red-600 hover:text-red-700">accessibility@hackerthink.com</a></li>
                  <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                  <li><strong>Hours:</strong> Monday - Friday, 9am - 5pm EST</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="bg-red-50 rounded-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">We Welcome Your Feedback</h2>
            <p className="text-gray-700 mb-4">
              Your feedback helps us improve our accessibility. If you encounter any accessibility barriers, 
              please let us know using the contact information above. We will make every effort to address your concerns.
            </p>
            <p className="text-gray-600 text-sm">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

