import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';

interface RelatedInterview {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  publish_date: string;
  guest_name: string;
  guest_slug?: string;
  guest_photo?: string;
}

interface RelatedInterviewsProps {
  interviews: RelatedInterview[];
}

export default function RelatedInterviews({ interviews }: RelatedInterviewsProps) {
  if (!interviews || interviews.length === 0) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Interviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            href={`/interviews/${interview.slug}`}
            className="group hover:shadow-lg transition-shadow rounded-lg overflow-hidden border border-gray-200"
          >
            {interview.featured_image && (
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={interview.featured_image}
                  alt={interview.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {interview.title}
              </h3>
              
              {interview.excerpt && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {interview.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {interview.guest_photo ? (
                    <Image
                      src={interview.guest_photo}
                      alt={interview.guest_name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <FaUser className="text-gray-400 text-xs" />
                  )}
                  <span className="truncate">{interview.guest_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="text-gray-400 text-xs" />
                  <span>{formatDate(interview.publish_date)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

