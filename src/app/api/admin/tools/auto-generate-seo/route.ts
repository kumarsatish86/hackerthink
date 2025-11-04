import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, platform, type } = body;

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Generate SEO data based on the content
    const seo_title = `${title} - ${category || 'Tool'} | HackerThink`;
    const seo_description = description 
      ? `${description.substring(0, 150)}${description.length > 150 ? '...' : ''}`
      : `Use this ${category || 'tool'} for ${platform || 'Linux'} system administration and management tasks.`;
    
    const keywords = [
      'linux',
      'tool',
      category?.toLowerCase() || 'utility',
      platform?.toLowerCase() || 'linux',
      'system administration',
      'command line',
      'terminal',
      'open source'
    ].filter(Boolean).join(', ');

    // Generate schema structure
    const schema_json = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": title,
      "description": seo_description,
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/tools/${title.toLowerCase().replace(/\s+/g, '-')}`,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": platform || "Linux",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HackerThink",
        "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
      },
      "keywords": keywords,
      "datePublished": new Date().toISOString(),
      "inLanguage": "en"
    }, null, 2);

    return NextResponse.json({
      seo_title,
      seo_description,
      seo_keywords: keywords,
      schema_json
    });

  } catch (error) {
    console.error('Error generating SEO data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

