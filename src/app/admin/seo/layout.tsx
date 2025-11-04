"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SEOLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Overview', path: '/admin/seo' },
    { name: 'Sitemap', path: '/admin/seo/sitemap' },
    { name: 'Robots.txt', path: '/admin/seo/robots' },
    { name: 'Redirects', path: '/admin/seo/redirects' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {navItems.map((item) => {
              const isActive = 
                (item.path === '/admin/seo' && pathname === '/admin/seo') || 
                (item.path !== '/admin/seo' && pathname.startsWith(item.path));
                
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? 'border-b-2 border-red-500 text-red-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
} 
