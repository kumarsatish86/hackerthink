'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data (to be replaced with actual API calls)
const mockCourses = [
  { id: 1, title: 'Linux Fundamentals', progress: 65, image: '/images/courses/linux-fundamentals.jpg' },
  { id: 2, title: 'Network Administration', progress: 30, image: '/images/courses/network-admin.jpg' },
  { id: 3, title: 'Docker Essentials', progress: 10, image: '/images/courses/docker.jpg' },
];

const mockRecommendedCourses = [
  { id: 4, title: 'Kubernetes for Beginners', category: 'DevOps', image: '/images/courses/kubernetes.jpg' },
  { id: 5, title: 'AWS Cloud Practitioner', category: 'Cloud', image: '/images/courses/aws.jpg' },
  { id: 6, title: 'Cybersecurity Basics', category: 'Security', image: '/images/courses/security.jpg' },
];

const mockActivities = [
  { id: 1, type: 'course_progress', course: 'Linux Fundamentals', date: '2 hours ago' },
  { id: 2, type: 'quiz_completed', course: 'Networking Basics Quiz', date: 'Yesterday' },
  { id: 3, type: 'certificate', course: 'Git Essentials', date: 'Last week' },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session?.user?.name || 'User'}!</p>
      </div>

      {/* Progress Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-500">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-red-600">
                        {course.progress}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                    <div
                      style={{ width: `${course.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                    ></div>
                  </div>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="block text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {mockActivities.map((activity) => (
              <li key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    {activity.type === 'course_progress' && (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )}
                    {activity.type === 'quiz_completed' && (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {activity.type === 'certificate' && (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.type === 'course_progress' && `Made progress on ${activity.course}`}
                      {activity.type === 'quiz_completed' && `Completed ${activity.course}`}
                      {activity.type === 'certificate' && `Earned certificate for ${activity.course}`}
                    </div>
                    <div className="text-sm text-gray-500">{activity.date}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-3 text-center">
            <Link href="/dashboard/activity" className="text-sm font-medium text-red-600 hover:text-red-500">
              View all activity
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRecommendedCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-500">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  {course.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <Link
                  href={`/courses/${course.id}`}
                  className="block text-center bg-white border border-red-600 hover:bg-red-50 text-red-600 font-medium py-2 px-4 rounded"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 