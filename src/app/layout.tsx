import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';
import 'katex/dist/katex.min.css';
import SiteLayoutWrapper from '@/components/layout/SiteLayoutWrapper';
import { fetchSiteSettings } from '@/lib/dynamicConfig';

// Mark the root layout as dynamic
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata() {
  try {
    // Fetch site settings using our dynamic helper
    const settings = await fetchSiteSettings(['site_name', 'site_description', 'favicon_path']);
    
    return {
      title: settings.site_name || 'AIWeb - AI News, Tools & Learning Platform',
      description: settings.site_description || 'Your comprehensive platform for AI news, tools, learning, and model training',
      icons: {
        icon: settings.favicon_path || '/favicon.ico',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Return default metadata if there's an error
    return {
      title: 'AIWeb - AI News, Tools & Learning Platform',
      description: 'Your comprehensive platform for AI news, tools, learning, and model training',
      icons: {
        icon: '/favicon.ico',
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
    <html lang="en">
      <head>
        {/* Add meta tags for better session management */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
          {/* Fix for related commands */}
          <script src="/scripts/related-commands-fix.js" async></script>
        
        <Providers>
          <SiteLayoutWrapper>
            {children}
          </SiteLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
