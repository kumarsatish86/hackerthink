import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, level, duration } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Generate SEO title
    const seo_title = `${title} - Complete Learning Roadmap | LinuxConcept`;
    
    // Generate SEO description
    const seo_description = `Master ${title.toLowerCase()} with our comprehensive learning roadmap. ${description} Perfect for ${level || 'all skill levels'}. Start your journey today!`;
    
    // Generate keywords
    const keywords = [
      title.toLowerCase(),
      'learning roadmap',
      'linux',
      'tutorial',
      'guide',
      'step by step',
      'beginner to advanced',
      level || 'all levels',
      duration ? `${duration} days` : 'self-paced'
    ].filter(Boolean);
    
    const seo_keywords = keywords.join(', ');

    // Generate JSON-LD schema for LearningResource
    const schema_json = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": title,
      "description": description,
      "educationalLevel": level || "All Levels",
      "timeRequired": duration ? `P${duration}D` : "Self-paced",
      "provider": {
        "@type": "Organization",
        "name": "LinuxConcept",
        "url": "https://ainews.com"
      },
      "learningResourceType": "Learning Path",
      "educationalUse": "instruction",
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": "student"
      },
      "keywords": keywords.join(', '),
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "url": `https://ainews.com/learning-roadmap/${title.toLowerCase().replace(/\s+/g, '-')}`
    }, null, 2);

    return NextResponse.json({
      seo_title,
      seo_description,
      seo_keywords,
      schema_json
    });

  } catch (error) {
    console.error('Error generating SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO data' },
      { status: 500 }
    );
  }
}

