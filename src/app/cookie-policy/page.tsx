import { Metadata } from 'next';
import { FaCookie, FaCheckCircle, FaCog, FaChartLine, FaShieldAlt } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Cookie Policy - HackerThink',
  description: 'How we use cookies and tracking technologies',
};

export default function CookiePolicy() {
  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaCookie className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Learn how we use cookies and similar technologies on our platform
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* What Are Cookies */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
              <FaCookie className="w-6 h-6 mr-2" />
              What Are Cookies?
            </h2>
            <p className="text-gray-700">
              Cookies are small text files placed on your device when you visit a website. They help us provide, 
              protect, and improve our services by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
              <FaCheckCircle className="w-6 h-6 mr-2" />
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-700">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                <p className="text-gray-700">
                  These cookies allow us to remember choices you make and provide enhanced, personalized features. 
                  They may be set by us or by third-party providers whose services we have added to our pages.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-700">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                <p className="text-gray-700">
                  These cookies are used to track visitors across websites. The intention is to display ads 
                  that are relevant and engaging for individual users.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
              <FaCog className="w-6 h-6 mr-2" />
              How We Use Cookies
            </h2>
            <ul className="list-disc ml-6 space-y-3 text-gray-700">
              <li>Keeping you signed in to your account</li>
              <li>Remembering your preferences and settings</li>
              <li>Providing personalized content and recommendations</li>
              <li>Understanding how you use our platform</li>
              <li>Improving our services and user experience</li>
              <li>Analyzing site traffic and usage patterns</li>
              <li>Delivering relevant advertisements</li>
            </ul>
          </section>

          {/* Managing Cookies */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
              <FaChartLine className="w-6 h-6 mr-2" />
              Managing Cookies
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, 
                but you can usually modify your browser settings to decline cookies if you prefer.
              </p>
              <p>Here's how to manage cookies in popular browsers:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
              </ul>
              <p className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <strong>Note:</strong> Blocking all cookies may limit your use of certain features on our platform.
              </p>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
              <FaShieldAlt className="w-6 h-6 mr-2" />
              Third-Party Cookies
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics 
                and deliver advertisements. These third-party cookies may include:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Google Analytics for website statistics</li>
                <li>Social media platforms for sharing features</li>
                <li>Advertising networks for targeted ads</li>
                <li>Content delivery networks for performance optimization</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-red-50 rounded-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Questions About Cookies?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies, please contact us at <a href="mailto:privacy@hackerthink.com" className="text-red-600 hover:text-red-700">privacy@hackerthink.com</a>
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

