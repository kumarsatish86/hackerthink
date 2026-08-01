'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaBell, FaUser, FaBookmark, FaSignInAlt } from 'react-icons/fa';

export default function ForumNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: '/forum', label: 'Home', icon: FaHome },
    { href: '/forum/search', label: 'Search', icon: FaSearch },
  ];

  if (session?.user) {
    navLinks.push(
      { href: '/forum/bookmarks', label: 'Bookmarks', icon: FaBookmark },
      { href: '/forum/notifications', label: 'Notifications', icon: FaBell },
      { href: `/forum/user/${session.user.id}`, label: 'Profile', icon: FaUser }
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/forum" className="text-xl font-bold text-red-600">
              Forum
            </Link>
            <div className="flex space-x-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <span className="text-sm text-gray-700">
                {session.user.name}
              </span>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSignInAlt className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

