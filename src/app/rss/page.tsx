'use client';

import { FaRss, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

export default function RSSPage() {
  const feeds = [
    { name: 'All News', url: '/rss/feed', description: 'Complete feed of all news articles' },
    { name: 'Breaking News', url: '/rss/breaking', description: 'Latest breaking news only' },
    { name: 'Tech News', url: '/rss/tech', description: 'Technology and innovation news' },
    { name: 'Business', url: '/rss/business', description: 'Business and market updates' },
    { name: 'Research', url: '/rss/research', description: 'Research papers and scientific news' },
    { name: 'Opinion', url: '/rss/opinion', description: 'Editorials and opinion pieces' },
    { name: 'World News', url: '/rss/world', description: 'International news and events' },
  ];

  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaRss className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            RSS Feeds
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Stay updated with the latest news using RSS feeds
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is RSS */}
        <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-red-700 mb-4">What is RSS?</h2>
          <p className="text-gray-700">
            RSS (Really Simple Syndication) feeds allow you to stay up-to-date with your favorite websites. 
            Instead of visiting multiple sites each day, you can use an RSS reader to view the latest content 
            from all of your favorite sites in one place.
          </p>
        </section>

        {/* Available Feeds */}
        <section className="bg-white rounded-xl shadow-md p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
            <FaRss className="w-6 h-6 mr-2" />
            Available Feeds
          </h2>
          <div className="space-y-4">
            {feeds.map((feed, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{feed.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{feed.description}</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-red-700 block break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}${feed.url}` : feed.url}
                    </code>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      const fullUrl = `${window.location.origin}${feed.url}`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(fullUrl);
                        alert('Feed URL copied to clipboard!');
                      }
                    }}
                    className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    <FaCopy className="w-4 h-4 mr-1" />
                    Copy URL
                  </button>
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    <FaExternalLinkAlt className="w-4 h-4 mr-1" />
                    View Feed
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="bg-red-50 rounded-xl p-8 border border-red-200 mb-8">
          <h2 className="text-2xl font-bold text-red-700 mb-4">How to Use RSS Feeds</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Choose an RSS Reader</h3>
              <p className="text-sm">
                Popular RSS readers include Feedly, Inoreader, NewsBlur, and Flipboard. You can also use 
                browser-based readers like Feedly or dedicated apps on your mobile device.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Subscribe to a Feed</h3>
              <p className="text-sm">
                Copy the RSS feed URL of your choice and paste it into your RSS reader. Your reader will 
                automatically fetch the latest content whenever new articles are published.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Stay Updated</h3>
              <p className="text-sm">
                Your RSS reader will notify you whenever new content is available, ensuring you never miss 
                the latest news from HackerThink.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center">
          <p className="text-gray-600">
            Questions about our RSS feeds? Contact us at <a href="mailto:support@hackerthink.com" className="text-red-600 hover:text-red-700">support@hackerthink.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}

