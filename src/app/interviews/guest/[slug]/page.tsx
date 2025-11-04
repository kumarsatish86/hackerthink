import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GuestProfile from '@/components/interviews/GuestProfile';
import InterviewCard from '@/components/interviews/InterviewCard';
import { FaMicrophone } from 'react-icons/fa';

interface PageProps {
  params: { slug: string };
}

async function getGuestInterviews(slug: string, page: number = 1) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007'}/api/interviews/guest/${slug}?page=${page}&limit=12`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching guest interviews:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getGuestInterviews(params.slug, 1);
  
  if (!data || !data.guest) {
    return {
      title: 'Guest Not Found',
    };
  }

  const guest = data.guest;
  
  return {
    title: `Interviews with ${guest.name}`,
    description: guest.bio_summary || guest.bio || `Interviews with ${guest.name}`,
  };
}

export default async function GuestProfilePage({ params }: PageProps) {
  const data = await getGuestInterviews(params.slug, 1);
  
  if (!data || !data.guest) {
    notFound();
  }

  const { guest, interviews, pagination } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Interviews with {guest.name}
            </h1>
            {guest.bio_summary && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {guest.bio_summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Guest Profile */}
          <div className="lg:col-span-1">
            <GuestProfile guest={guest} />
          </div>

          {/* Main Content - Interviews */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                All Interviews ({pagination.total})
              </h2>
              <p className="text-gray-600">
                Browse all interviews with {guest.name}
              </p>
            </div>

            {interviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <FaMicrophone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interviews yet
                </h3>
                <p className="text-gray-500">
                  Check back later for interviews with {guest.name}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {interviews.map((interview: any) => (
                    <InterviewCard key={interview.id} interview={interview} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Link
                      href={`/interviews/guest/${params.slug}?page=${pagination.page - 1}`}
                      className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ${
                        pagination.page === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                      }`}
                    >
                      Previous
                    </Link>
                    
                    <span className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    
                    <Link
                      href={`/interviews/guest/${params.slug}?page=${pagination.page + 1}`}
                      className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ${
                        pagination.page >= pagination.pages ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                      }`}
                    >
                      Next
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

