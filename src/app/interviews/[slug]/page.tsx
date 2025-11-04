import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GuestProfile from '@/components/interviews/GuestProfile';
import InterviewQASection from '@/components/interviews/InterviewQASection';
import RelatedInterviews from '@/components/interviews/RelatedInterviews';
import FormattedContent from '@/components/FormattedContent';
import { FaCalendarAlt, FaEye, FaShareAlt, FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';

interface PageProps {
  params: { slug: string };
}

async function getInterview(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'}/api/interviews/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching interview:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getInterview(params.slug);
  
  if (!data || !data.interview) {
    return {
      title: 'Interview Not Found',
    };
  }

  const interview = data.interview;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';
  
  return {
    title: interview.meta_title || interview.title,
    description: interview.meta_description || interview.excerpt,
    keywords: interview.seo_keywords,
    openGraph: {
      title: interview.meta_title || interview.title,
      description: interview.meta_description || interview.excerpt,
      type: 'article',
      images: interview.featured_image ? [interview.featured_image] : [],
      url: `${siteUrl}/interviews/${interview.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: interview.meta_title || interview.title,
      description: interview.meta_description || interview.excerpt,
      images: interview.featured_image ? [interview.featured_image] : [],
    },
  };
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const data = await getInterview(params.slug);
  
  if (!data || !data.interview) {
    notFound();
  }

  const { interview, relatedInterviews } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';
  const interviewUrl = `${siteUrl}/interviews/${interview.slug}`;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const shareText = `${interview.title} - Interview with ${interview.guest_name}`;
  const shareUrl = interviewUrl;

  // Generate JSON-LD schema
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Interview',
    headline: interview.title,
    description: interview.excerpt || interview.meta_description,
    image: interview.featured_image,
    datePublished: interview.publish_date,
    dateModified: interview.updated_at,
    author: {
      '@type': 'Person',
      name: interview.guest_name,
      jobTitle: interview.guest_title,
      worksFor: {
        '@type': 'Organization',
        name: interview.guest_company,
      },
    },
    interviewee: {
      '@type': 'Person',
      name: interview.guest_name,
      jobTitle: interview.guest_title,
      worksFor: {
        '@type': 'Organization',
        name: interview.guest_company,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'HackerThink',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': interviewUrl,
    },
  };

  const qaItems = interview.content?.qa || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      
      <article className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {interview.category_name && (
              <Link
                href={`/interviews/category/${interview.category_slug || interview.category_name.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4"
              >
                {interview.category_name}
              </Link>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {interview.title}
            </h1>
            
            {interview.excerpt && (
              <p className="text-xl text-gray-600 mb-6">
                {interview.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <FaCalendarAlt />
                <span>{formatDate(interview.publish_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEye />
                <span>{interview.view_count || 0} views</span>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                {interview.interview_type}
              </span>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 transition-colors"
                title="Share on Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Share on LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Share on Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {interview.featured_image && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={interview.featured_image}
                alt={interview.featured_image_alt || interview.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              {interview.content?.intro && (
                <div className="prose prose-lg max-w-none">
                  <FormattedContent content={interview.content.intro} />
                </div>
              )}

              {/* Q&A Section */}
              {qaItems.length > 0 && (
                <InterviewQASection qaItems={qaItems} />
              )}

              {/* Conclusion */}
              {interview.content?.outro && (
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h2>
                  <FormattedContent content={interview.content.outro} />
                </div>
              )}

              {/* Tags */}
              {interview.tags && interview.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200">
                  {interview.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Guest Profile */}
              <GuestProfile
                guest={{
                  name: interview.guest_name,
                  slug: interview.guest_slug,
                  photo_url: interview.guest_photo,
                  bio: interview.guest_bio,
                  bio_summary: interview.guest_bio_summary,
                  title: interview.guest_title,
                  company: interview.guest_company,
                  company_url: interview.guest_company_url,
                  designation: interview.guest_designation,
                  social_links: interview.guest_social_links,
                  verified: interview.guest_verified,
                }}
              />
            </div>
          </div>

          {/* Related Interviews */}
          {relatedInterviews && relatedInterviews.length > 0 && (
            <div className="mt-12">
              <RelatedInterviews interviews={relatedInterviews} />
            </div>
          )}
        </div>
      </article>
    </>
  );
}

