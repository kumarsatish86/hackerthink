import { Metadata } from 'next';
import Link from 'next/link';
import { FaUsers, FaComments, FaDiscord, FaGithub, FaTwitter, FaCalendarAlt } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Community - HackerThink',
  description: 'Join the HackerThink community of AI enthusiasts and developers',
};

export default function CommunityPage() {
  const events = [
    { title: 'AI Hackathon 2025', date: 'Dec 15-17', type: 'Online' },
    { title: 'ML Research Meetup', date: 'Jan 10', type: 'San Francisco' },
    { title: 'Open Source Summit', date: 'Feb 20', type: 'Online' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaUsers className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Join Our Community
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Connect with fellow AI enthusiasts, developers, and researchers
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">50K+</div>
            <div className="text-gray-600">Members</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">5K+</div>
            <div className="text-gray-600">Daily Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">100+</div>
            <div className="text-gray-600">Daily Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>

        {/* Join Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Discord */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <FaDiscord className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Discord</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Real-time chat, voice channels, and quick help from the community
            </p>
            <Link
              href="#"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              Join Discord <span className="ml-2">→</span>
            </Link>
          </div>

          {/* GitHub */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
                <FaGithub className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">GitHub</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Open source projects, code snippets, and collaborative development
            </p>
            <Link
              href="#"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View on GitHub <span className="ml-2">→</span>
            </Link>
          </div>

          {/* Twitter */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <FaTwitter className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Twitter</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Stay updated with latest news, announcements, and community highlights
            </p>
            <Link
              href="#"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              Follow Us <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaCalendarAlt className="w-6 h-6 mr-2 text-red-600" />
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.type}</p>
                </div>
                <div className="text-sm font-medium text-red-600">{event.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Forum Coming Soon */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Community Forum Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            We're building a comprehensive community platform with forums, discussions, and collaboration tools.
          </p>
          <Link
            href="#"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            Get Notified When Available <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

