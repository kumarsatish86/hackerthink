import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, platform, type } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate SEO title
    const seoTitle = `${title} - Linux Command Guide | LinuxConcept`;
    
    // Generate SEO description
    const categoryName = category ? category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Linux';
    const platformName = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Linux';
    
    const seoDescription = `Learn how to use the ${title} command in ${platformName}. Complete guide with syntax, examples, options, and best practices for ${categoryName} tasks.`;
    
    // Generate SEO keywords
    const keywords = [
      title.toLowerCase(),
      'linux command',
      'command line',
      'terminal',
      'bash',
      'unix',
      platform?.toLowerCase() || 'linux',
      category?.replace('-', ' ') || 'system',
      'tutorial',
      'guide',
      'examples',
      'syntax'
    ].filter(Boolean).join(', ');

    // Generate JSON-LD Schema
    const schemaJson = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to use ${title} command`,
      "description": seoDescription,
      "image": "https://ainews.com/images/logo.png",
      "author": {
        "@type": "Organization",
        "name": "LinuxConcept",
        "url": "https://ainews.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "LinuxConcept",
        "url": "https://ainews.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ainews.com/images/logo.png"
        }
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://ainews.com/commands/${title.toLowerCase().replace(/\s+/g, '-')}`
      },
      "step": [
        {
          "@type": "HowToStep",
          "name": "Command Syntax",
          "text": `Use the ${title} command with proper syntax and options.`,
          "url": `https://ainews.com/commands/${title.toLowerCase().replace(/\s+/g, '-')}#syntax`
        },
        {
          "@type": "HowToStep", 
          "name": "Examples",
          "text": `Follow practical examples to understand ${title} usage.`,
          "url": `https://ainews.com/commands/${title.toLowerCase().replace(/\s+/g, '-')}#examples`
        }
      ],
      "totalTime": "PT5M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Linux Terminal"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": title
        }
      ],
      "about": {
        "@type": "Thing",
        "name": `${categoryName} Commands`,
        "description": `Commands for ${categoryName} tasks in ${platformName}`
      }
    }, null, 2);

    return NextResponse.json({
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: keywords,
      schema_json: schemaJson
    });

  } catch (error) {
    console.error('Error generating SEO data for command:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO data' },
      { status: 500 }
    );
  }
}

