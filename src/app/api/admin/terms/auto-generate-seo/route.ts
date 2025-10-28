import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { term, definition, category } = await request.json();

    if (!term || !definition) {
      return NextResponse.json({ error: 'Term and definition are required' }, { status: 400 });
    }

    // Generate SEO title (max 60 characters)
    const seoTitle = `${term} - ${category || 'Technical Term'} Definition | LinuxConcept`;
    const truncatedTitle = seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle;

    // Generate SEO description (max 160 characters)
    const cleanDefinition = definition.replace(/<[^>]*>/g, '').substring(0, 100);
    const seoDescription = `Learn about ${term.toLowerCase()}: ${cleanDefinition}${cleanDefinition.length === 100 ? '...' : ''}. Complete definition, examples, and usage.`;
    const truncatedDescription = seoDescription.length > 160 ? seoDescription.substring(0, 157) + '...' : seoDescription;

    // Generate keywords
    const keywords = [
      term.toLowerCase(),
      `${term.toLowerCase()} definition`,
      `${term.toLowerCase()} meaning`,
      'linux concept',
      'technical terms',
      'glossary',
      category?.toLowerCase() || 'general'
    ].join(', ');

    // Generate JSON-LD schema for DefinedTerm
    const schemaJson = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": term,
      "description": cleanDefinition,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "LinuxConcept Technical Glossary",
        "description": "A comprehensive glossary of technical terms and concepts"
      },
      "category": category || "General",
      "url": `https://ainews.com/term/${term.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}`,
      "publisher": {
        "@type": "Organization",
        "name": "LinuxConcept",
        "url": "https://ainews.com"
      }
    }, null, 2);

    return NextResponse.json({
      seo_title: truncatedTitle,
      seo_description: truncatedDescription,
      seo_keywords: keywords,
      schema_json: schemaJson
    });

  } catch (error) {
    console.error('Error generating SEO content:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO content' },
      { status: 500 }
    );
  }
}

