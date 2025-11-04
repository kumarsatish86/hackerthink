'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const [formData, setFormData] = useState({
    email: '',
    frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        type: 'success',
        text: 'Thank you for subscribing! Please check your email to confirm your subscription.'
      });
      
      setFormData({ email: '', frequency: 'daily' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Subscribe to <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">HackerThink</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest AI news, tutorials, tools, and insights. Get curated content delivered to your inbox.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Subscription Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Subscription</h2>
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 border-l-4 border-green-400 text-green-700' 
                  : 'bg-red-50 border-l-4 border-red-400 text-red-700'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="daily">Daily Newsletter</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="monthly">Monthly Roundup</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 text-center">
              By subscribing, you agree to our{' '}
              <Link href="/terms-of-service" className="text-red-600 hover:text-red-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-red-600 hover:text-red-700">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-gray-900">Breaking AI News</h3>
                    <p className="text-sm text-gray-600">Latest developments and breakthroughs in AI</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-gray-900">Expert Tutorials</h3>
                    <p className="text-sm text-gray-600">Step-by-step guides and practical tutorials</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-gray-900">Tool Recommendations</h3>
                    <p className="text-sm text-gray-600">Handpicked AI tools and resources</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-gray-900">Exclusive Content</h3>
                    <p className="text-sm text-gray-600">Early access to new tutorials and features</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Join Thousands of Learners</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-red-100">Subscribers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-red-100">Tutorials</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm text-red-100">AI Tools</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-md">
            <Link href="/" className="text-red-600 hover:text-red-700 font-medium flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

