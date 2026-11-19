import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';
import 'katex/dist/katex.min.css';
import SiteLayoutWrapper from '@/components/layout/SiteLayoutWrapper';
import { fetchSiteSettings } from '@/lib/dynamicConfig';

// Mark the root layout as dynamic
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

function iconTypeFromPath(path: string): string {
  const clean = path.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.ico')) return 'image/x-icon';
  if (
    clean.includes('/api/site-assets/favicon') ||
    clean.includes('/api/site-favicon') ||
    clean.includes('/api/site-images/favicon')
  ) {
    return 'image/x-icon';
  }
  return 'image/x-icon';
}

export async function generateMetadata() {
  try {
    // Fetch site settings using our dynamic helper
    const settings = await fetchSiteSettings(['site_name', 'site_description', 'favicon_path']);
    const faviconUrl = settings.favicon_path || '/api/site-favicon';
    const faviconType = iconTypeFromPath(faviconUrl);

    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXTAUTH_URL ||
          'http://localhost:3007'
      ),
      title: settings.site_name || 'AIWeb - AI News, Tools & Learning Platform',
      description: settings.site_description || 'Your comprehensive platform for AI news, tools, learning, and model training',
      icons: {
        icon: [
          { url: faviconUrl, type: faviconType, sizes: '32x32' },
          { url: faviconUrl, type: faviconType, sizes: '16x16' },
        ],
        shortcut: [{ url: faviconUrl, type: faviconType }],
        apple: [{ url: faviconUrl, type: faviconType, sizes: '180x180' }],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Return default metadata if there's an error
    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXTAUTH_URL ||
          'http://localhost:3007'
      ),
      title: 'AIWeb - AI News, Tools & Learning Platform',
      description: 'Your comprehensive platform for AI news, tools, learning, and model training',
      icons: {
        icon: [{ url: '/api/site-favicon', type: 'image/x-icon' }],
        shortcut: [{ url: '/api/site-favicon', type: 'image/x-icon' }],
        apple: [{ url: '/api/site-favicon', type: 'image/x-icon' }],
      },
    };
  }
}

// Root layout - server component that delegates client-side path checks to SiteLayoutWrapper
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          <SiteLayoutWrapper>{children}</SiteLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
