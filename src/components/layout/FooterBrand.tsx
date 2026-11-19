'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FooterBrand() {
  const [siteName, setSiteName] = useState('HackerThink');
  const [footerLogo, setFooterLogo] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);
  const [description, setDescription] = useState(
    'Your trusted source for breaking AI news, cutting-edge research, and industry insights. Stay ahead of the AI revolution with real-time updates and expert analysis.'
  );

  useEffect(() => {
    async function load() {
      try {
        const { fetchSiteSettings } = await import('@/lib/dynamicConfig');
        const settings = await fetchSiteSettings([
          'footer_logo_path',
          'logo_path',
          'site_name',
          'site_description',
          'footer_text',
        ]);
        setSiteName(settings.site_name || 'HackerThink');
        // Prefer dedicated footer logo; fall back to header logo
        setFooterLogo(settings.footer_logo_path || settings.logo_path || '');
        if (settings.site_description) setDescription(settings.site_description);
        setLogoFailed(false);
      } catch (error) {
        console.error('Error loading footer brand settings:', error);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Link href="/" className="inline-block mb-6">
        {footerLogo && !logoFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={footerLogo}
            alt={siteName}
            className="h-[56px] md:h-[75px] w-auto max-w-[500px] object-contain object-left"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
            {siteName}
          </h3>
        )}
      </Link>
      <p className="text-gray-300 text-lg leading-relaxed max-w-md">{description}</p>
    </div>
  );
}
