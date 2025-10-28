'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {

  // Breaking news data
  const breakingNews = [
    {
      id: 1,
      title: "OpenAI Announces GPT-5 with Multimodal Capabilities",
      excerpt: "The next generation of large language models promises revolutionary improvements in reasoning and multimodal understanding.",
      category: "Breaking",
      time: "2 hours ago",
      image: "/images/news/gpt5-announcement.jpg",
      slug: "openai-gpt5-announcement"
    },
    {
      id: 2,
      title: "Google's Gemini Pro 2.0 Surpasses Human Performance in Coding",
      excerpt: "New benchmarks show Google's latest AI model achieving unprecedented results in software development tasks.",
      category: "Research",
      time: "4 hours ago",
      image: "/images/news/gemini-pro-coding.jpg",
      slug: "google-gemini-pro-coding"
    },
    {
      id: 3,
      title: "EU AI Act Implementation Begins: What It Means for Developers",
      excerpt: "The European Union's comprehensive AI regulation framework takes effect, impacting AI development across the continent.",
      category: "Policy",
      time: "6 hours ago",
      image: "/images/news/eu-ai-act.jpg",
      slug: "eu-ai-act-implementation"
    }
  ];

  // Featured articles
  const featuredArticles = [
    {
      id: 1,
      title: "The Future of AI: 10 Breakthroughs That Will Change Everything",
      excerpt: "From quantum machine learning to artificial general intelligence, explore the technologies that will reshape our world.",
      author: "Dr. Sarah Chen",
      category: "Analysis",
      readTime: "12 min read",
      image: "/images/news/ai-future-breakthroughs.jpg",
      slug: "future-ai-10-breakthroughs"
    },
    {
      id: 2,
      title: "How AI is Revolutionizing Drug Discovery",
      excerpt: "Machine learning algorithms are accelerating the development of new medications, potentially saving millions of lives.",
      author: "Prof. Michael Rodriguez",
      category: "Healthcare",
      readTime: "8 min read",
      image: "/images/news/ai-drug-discovery.jpg",
      slug: "ai-revolutionizing-drug-discovery"
    },
    {
      id: 3,
      title: "The Ethics of AI: Balancing Innovation with Responsibility",
      excerpt: "As AI becomes more powerful, the need for ethical frameworks and responsible development practices grows urgent.",
      author: "Dr. Emily Watson",
      category: "Ethics",
      readTime: "10 min read",
      image: "/images/news/ai-ethics-responsibility.jpg",
      slug: "ethics-ai-balancing-innovation"
    }
  ];

  // Latest news
  const latestNews = [
    {
      id: 1,
      title: "Microsoft Copilot Gets Major Update with Advanced Reasoning",
      excerpt: "New capabilities include better code generation and natural language understanding.",
      category: "Product",
      time: "1 hour ago",
      slug: "microsoft-copilot-update"
    },
    {
      id: 2,
      title: "Tesla's Full Self-Driving Beta Reaches 500,000 Users",
      excerpt: "The autonomous driving system continues to expand with new safety features and improved performance.",
      category: "Automotive",
      time: "3 hours ago",
      slug: "tesla-fsd-beta-500k-users"
    },
    {
      id: 3,
      title: "Anthropic Releases Claude 3.5 Sonnet with Enhanced Math Skills",
      excerpt: "The latest model shows significant improvements in mathematical reasoning and problem-solving.",
      category: "Research",
      time: "5 hours ago",
      slug: "anthropic-claude-3-5-sonnet"
    },
    {
      id: 4,
      title: "AI-Powered Weather Prediction Achieves 99% Accuracy",
      excerpt: "New machine learning models are revolutionizing meteorology and climate science.",
      category: "Science",
      time: "7 hours ago",
      slug: "ai-weather-prediction-99-accuracy"
    },
    {
      id: 5,
      title: "Meta's AI Research Lab Publishes Breakthrough in Computer Vision",
      excerpt: "New techniques for image recognition could transform how machines understand visual data.",
      category: "Research",
      time: "9 hours ago",
      slug: "meta-ai-computer-vision-breakthrough"
    },
    {
      id: 6,
      title: "Startup Raises $100M for AI-Powered Medical Diagnostics",
      excerpt: "The company's technology can detect diseases from medical images with unprecedented accuracy.",
      category: "Funding",
      time: "11 hours ago",
      slug: "startup-100m-ai-medical-diagnostics"
    }
  ];

  // Trending topics
  const trendingTopics = [
    "GPT-5", "Quantum AI", "AI Ethics", "Machine Learning", "Computer Vision",
    "Natural Language Processing", "Robotics", "Autonomous Vehicles", "AI Regulation", "Neural Networks"
  ];

  // Tech News
  const techNews = [
    {
      id: 1,
      title: "Apple's New M4 Chip Features Dedicated AI Processing Unit",
      excerpt: "The latest Apple Silicon includes a 16-core Neural Engine capable of 38 trillion operations per second.",
      category: "Hardware",
      time: "3 hours ago",
      slug: "apple-m4-chip-ai-processing"
    },
    {
      id: 2,
      title: "NVIDIA Announces H200 GPU with 141GB HBM3e Memory",
      excerpt: "The new GPU is designed specifically for large language model training and inference workloads.",
      category: "Hardware",
      time: "5 hours ago",
      slug: "nvidia-h200-gpu-announcement"
    },
    {
      id: 3,
      title: "Google's Tensor G4 Chip Leaks Show AI-First Architecture",
      excerpt: "Leaked specifications reveal significant improvements in AI processing capabilities for Pixel devices.",
      category: "Hardware",
      time: "7 hours ago",
      slug: "google-tensor-g4-leaks"
    }
  ];

  // Business News
  const businessNews = [
    {
      id: 1,
      title: "OpenAI Raises $10B in Series C Funding Round",
      excerpt: "The funding round values OpenAI at $80 billion, making it one of the most valuable AI companies.",
      category: "Funding",
      time: "2 hours ago",
      slug: "openai-10b-funding-round"
    },
    {
      id: 2,
      title: "Microsoft's AI Revenue Surpasses $20B in Q4",
      excerpt: "Azure AI services and Copilot products drive record quarterly revenue for Microsoft.",
      category: "Earnings",
      time: "4 hours ago",
      slug: "microsoft-ai-revenue-20b"
    },
    {
      id: 3,
      title: "Tesla's Full Self-Driving Beta Now Available in 50 Countries",
      excerpt: "The autonomous driving system expands globally with new regulatory approvals.",
      category: "Expansion",
      time: "6 hours ago",
      slug: "tesla-fsd-beta-50-countries"
    }
  ];

  // Research News
  const researchNews = [
    {
      id: 1,
      title: "MIT Researchers Develop AI That Can Predict Protein Folding in Seconds",
      excerpt: "The new algorithm reduces protein structure prediction time from hours to seconds.",
      category: "Biology",
      time: "1 hour ago",
      slug: "mit-ai-protein-folding"
    },
    {
      id: 2,
      title: "Stanford Study Shows AI Can Detect Early Signs of Alzheimer's",
      excerpt: "Machine learning models identify biomarkers 6 years before clinical diagnosis.",
      category: "Healthcare",
      time: "3 hours ago",
      slug: "stanford-ai-alzheimers-detection"
    },
    {
      id: 3,
      title: "DeepMind's New AI Solves Complex Mathematical Problems",
      excerpt: "The system can solve Olympiad-level geometry problems with 90% accuracy.",
      category: "Mathematics",
      time: "5 hours ago",
      slug: "deepmind-ai-mathematics"
    }
  ];

  // Opinion/Editorial
  const opinionNews = [
    {
      id: 1,
      title: "The AI Revolution: Are We Ready for What's Coming?",
      excerpt: "Industry experts weigh in on the rapid pace of AI development and its implications.",
      author: "Dr. Sarah Chen",
      category: "Editorial",
      time: "2 hours ago",
      slug: "ai-revolution-ready"
    },
    {
      id: 2,
      title: "Why AI Regulation Must Keep Pace with Innovation",
      excerpt: "A call for balanced AI governance that protects society while fostering innovation.",
      author: "Prof. Michael Rodriguez",
      category: "Policy",
      time: "4 hours ago",
      slug: "ai-regulation-innovation"
    },
    {
      id: 3,
      title: "The Future of Work in an AI-Driven Economy",
      excerpt: "How artificial intelligence will reshape employment and create new opportunities.",
      author: "Dr. Emily Watson",
      category: "Economy",
      time: "6 hours ago",
      slug: "future-work-ai-economy"
    }
  ];

  // World News
  const worldNews = [
    {
      id: 1,
      title: "China Announces $50B AI Investment Plan",
      excerpt: "The government's new initiative aims to make China a global leader in AI by 2030.",
      category: "Asia",
      time: "1 hour ago",
      slug: "china-50b-ai-investment"
    },
    {
      id: 2,
      title: "EU's AI Act Implementation Begins Across Member States",
      excerpt: "The comprehensive AI regulation framework takes effect with new compliance requirements.",
      category: "Europe",
      time: "3 hours ago",
      slug: "eu-ai-act-implementation"
    },
    {
      id: 3,
      title: "Japan's AI Strategy Focuses on Human-Robot Collaboration",
      excerpt: "The country's new AI policy emphasizes coexistence between humans and intelligent machines.",
      category: "Asia",
      time: "5 hours ago",
      slug: "japan-ai-human-robot-collaboration"
    }
  ];


  return (
    <div className="bg-white min-h-screen">
      {/* Main News Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main News Column */}
          <div className="lg:col-span-3">
            {/* Top Story */}
            <div className="mb-8 border-b border-gray-200 pb-8">
              <div className="flex items-center mb-4">
                <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold mr-3">TOP STORY</span>
                <span className="text-sm text-gray-500">{breakingNews[0].time}</span>
          </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                <Link href={`/articles/${breakingNews[0].slug}`} className="hover:text-red-600">
                  {breakingNews[0].title}
                </Link>
              </h1>
              <p className="text-lg text-gray-700 mb-4">{breakingNews[0].excerpt}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>By AI News Staff</span>
                <span className="mx-2">•</span>
                <span>{breakingNews[0].time}</span>
                    </div>
                    </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {breakingNews.slice(1).map((news) => (
                <div key={news.id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center mb-2">
                    <span className={`px-2 py-1 text-xs font-bold mr-2 ${
                      news.category === 'Breaking' ? 'bg-red-600 text-white' :
                      news.category === 'Research' ? 'bg-blue-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {news.category}
                    </span>
                    <span className="text-sm text-gray-500">{news.time}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                      {news.title}
                    </Link>
            </h2>
                  <p className="text-gray-700 text-sm">{news.excerpt}</p>
                </div>
              ))}
            </div>

            {/* Tech News Hero Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Tech News</h2>
              
              {/* Featured Tech Story */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                  <span className="text-sm text-gray-500">{techNews[0].time}</span>
          </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  <Link href={`/articles/${techNews[0].slug}`} className="hover:text-red-600">
                    {techNews[0].title}
                  </Link>
                </h1>
                <p className="text-lg text-gray-700 mb-4">{techNews[0].excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By Tech Reporter</span>
                  <span className="mx-2">•</span>
                  <span>{techNews[0].time}</span>
        </div>
      </div>
      
              {/* Secondary Tech Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {techNews.slice(1).map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-600 text-white px-2 py-1 text-xs font-bold mr-2">
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{news.time}</span>
            </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                        {news.title}
            </Link>
                    </h3>
                    <p className="text-gray-700 text-sm">{news.excerpt}</p>
                  </div>
                ))}
                  </div>
                </div>
                
            {/* Business News Hero Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Business</h2>
              
              {/* Featured Business Story */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                  <span className="text-sm text-gray-500">{businessNews[0].time}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  <Link href={`/articles/${businessNews[0].slug}`} className="hover:text-red-600">
                    {businessNews[0].title}
                  </Link>
                </h1>
                <p className="text-lg text-gray-700 mb-4">{businessNews[0].excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By Business Reporter</span>
                  <span className="mx-2">•</span>
                  <span>{businessNews[0].time}</span>
                </div>
              </div>

              {/* Secondary Business Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businessNews.slice(1).map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-bold mr-2 ${
                        news.category === 'Funding' ? 'bg-green-600 text-white' :
                        news.category === 'Earnings' ? 'bg-yellow-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {news.category}
                    </span>
                      <span className="text-sm text-gray-500">{news.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                        {news.title}
                      </Link>
                    </h3>
                    <p className="text-gray-700 text-sm">{news.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Research News Hero Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Research</h2>
              
              {/* Featured Research Story */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                  <span className="text-sm text-gray-500">{researchNews[0].time}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  <Link href={`/articles/${researchNews[0].slug}`} className="hover:text-red-600">
                    {researchNews[0].title}
                  </Link>
                </h1>
                <p className="text-lg text-gray-700 mb-4">{researchNews[0].excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By Research Reporter</span>
                  <span className="mx-2">•</span>
                  <span>{researchNews[0].time}</span>
                </div>
              </div>

              {/* Secondary Research Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {researchNews.slice(1).map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-bold mr-2 ${
                        news.category === 'Biology' ? 'bg-green-600 text-white' :
                        news.category === 'Healthcare' ? 'bg-red-600 text-white' :
                        'bg-indigo-600 text-white'
                      }`}>
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{news.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                        {news.title}
                      </Link>
                    </h3>
                    <p className="text-gray-700 text-sm">{news.excerpt}</p>
                  </div>
                ))}
                  </div>
                </div>
                
            {/* Opinion Hero Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Opinion</h2>
              
              {/* Featured Opinion Story */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-orange-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                  <span className="text-sm text-gray-500">{opinionNews[0].time}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  <Link href={`/articles/${opinionNews[0].slug}`} className="hover:text-red-600">
                    {opinionNews[0].title}
                  </Link>
                </h1>
                <p className="text-lg text-gray-700 mb-4">{opinionNews[0].excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By {opinionNews[0].author}</span>
                  <span className="mx-2">•</span>
                  <span>{opinionNews[0].time}</span>
                </div>
              </div>

              {/* Secondary Opinion Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opinionNews.slice(1).map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-bold mr-2 ${
                        news.category === 'Editorial' ? 'bg-orange-600 text-white' :
                        news.category === 'Policy' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{news.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                        {news.title}
                      </Link>
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">{news.excerpt}</p>
                    <p className="text-xs text-gray-500">By {news.author}</p>
              </div>
            ))}
        </div>
      </div>
      
            {/* World News Hero Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">World</h2>
              
              {/* Featured World Story */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                  <span className="text-sm text-gray-500">{worldNews[0].time}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  <Link href={`/articles/${worldNews[0].slug}`} className="hover:text-red-600">
                    {worldNews[0].title}
                  </Link>
                </h1>
                <p className="text-lg text-gray-700 mb-4">{worldNews[0].excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By World Reporter</span>
                  <span className="mx-2">•</span>
                  <span>{worldNews[0].time}</span>
                </div>
          </div>
          
              {/* Secondary World Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {worldNews.slice(1).map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-bold mr-2 ${
                        news.category === 'Asia' ? 'bg-red-600 text-white' :
                        news.category === 'Europe' ? 'bg-blue-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{news.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                        {news.title}
                      </Link>
                    </h3>
                    <p className="text-gray-700 text-sm">{news.excerpt}</p>
                  </div>
                ))}
              </div>
                </div>

            {/* Latest News Feed */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Latest News</h2>
              <div className="space-y-4">
                {latestNews.map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-bold mr-2 ${
                            news.category === 'Product' ? 'bg-blue-600 text-white' :
                            news.category === 'Research' ? 'bg-green-600 text-white' :
                            news.category === 'Science' ? 'bg-purple-600 text-white' :
                            news.category === 'Funding' ? 'bg-yellow-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {news.category}
                          </span>
                          <span className="text-sm text-gray-500">{news.time}</span>
                  </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                            {news.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 text-sm">{news.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
          {/* News Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Market Watch */}
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Market Watch</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Stocks</span>
                    <span className="text-sm text-green-600">+2.4%</span>
            </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tech Sector</span>
                    <span className="text-sm text-green-600">+1.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Crypto AI</span>
                    <span className="text-sm text-red-600">-0.5%</span>
                  </div>
                </div>
                </div>
                
              {/* Trending Now */}
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Trending Now</h3>
                <div className="space-y-3">
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-sm font-bold text-gray-400 mr-2">{index + 1}</span>
                  <Link
                        href={`/search?q=${topic}`}
                        className="text-sm text-gray-700 hover:text-red-600"
                  >
                        {topic}
                  </Link>
              </div>
            ))}
        </div>
      </div>
      
              {/* Quick News */}
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Quick News</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-500">2h ago</span>
                    <p className="text-gray-700 mt-1">Microsoft announces new AI chip for cloud computing</p>
          </div>
                  <div className="text-sm">
                    <span className="text-gray-500">4h ago</span>
                    <p className="text-gray-700 mt-1">Tesla's AI team publishes breakthrough in autonomous driving</p>
              </div>
                  <div className="text-sm">
                    <span className="text-gray-500">6h ago</span>
                    <p className="text-gray-700 mt-1">Meta's new AI model shows 40% improvement in reasoning</p>
          </div>
        </div>
      </div>
      
              {/* Newsletter */}
              <div className="bg-red-600 text-white p-4">
                <h3 className="text-lg font-bold mb-2">Newsletter</h3>
                <p className="text-sm opacity-90 mb-4">Get breaking AI news delivered to your inbox</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded text-gray-900 text-sm"
                  />
                  <button className="w-full bg-white text-red-600 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
