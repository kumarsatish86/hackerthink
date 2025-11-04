import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaEye, FaCalendarAlt } from 'react-icons/fa';

interface InterviewCardProps {
  interview: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string;
    featured_image_alt?: string;
    interview_type: string;
    featured?: boolean;
    view_count: number;
    publish_date: string;
    guest_name: string;
    guest_slug?: string;
    guest_photo?: string;
    category_name?: string;
  };
}

export default function InterviewCard({ interview }: InterviewCardProps) {
  const getTypeBadge = (type: string) => {
    const badges = {
      text: 'bg-purple-100 text-purple-800',
      video: 'bg-red-100 text-red-800',
      podcast: 'bg-orange-100 text-orange-800',
      mixed: 'bg-indigo-100 text-indigo-800'
    };
    return badges[type as keyof typeof badges] || badges.text;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Link
      href={`/interviews/${interview.slug}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group block"
    >
      {interview.featured_image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={interview.featured_image}
            alt={interview.featured_image_alt || interview.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {interview.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(interview.interview_type)}`}>
            {interview.interview_type}
          </span>
          {interview.category_name && (
            <span className="text-xs text-gray-500">
              {interview.category_name}
            </span>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {interview.title}
        </h2>
        
        {interview.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {interview.excerpt}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            {interview.guest_photo ? (
              <Image
                src={interview.guest_photo}
                alt={interview.guest_name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <FaUser className="text-gray-400" />
            )}
            <span className="truncate">{interview.guest_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaEye className="text-gray-400" />
            <span>{interview.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-400" />
            <span>{formatDate(interview.publish_date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

