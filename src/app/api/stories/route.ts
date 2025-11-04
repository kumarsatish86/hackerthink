import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET - Fetch all published web stories for public view
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          id, title, slug, cover_image, created_at, updated_at, content,
          CASE 
            WHEN title ILIKE '%beginner%' OR title ILIKE '%getting started%' OR title ILIKE '%first%' OR title ILIKE '%introduction%' THEN 'beginners'
            WHEN title ILIKE '%advanced%' OR title ILIKE '%server%' OR title ILIKE '%administration%' OR title ILIKE '%networking%' THEN 'advanced'
            ELSE 'tutorials'
          END as category
        FROM web_stories 
        WHERE is_published = true
        ORDER BY created_at DESC
      `);
      
      // Process stories to create proper excerpts
      const processedStories = result.rows.map(story => {
        let excerpt = 'Learn about Linux concepts and best practices with this comprehensive guide.';
        
        try {
          // Parse the JSON content to extract text from slides
          const slides = JSON.parse(story.content);
          if (Array.isArray(slides) && slides.length > 0) {
            // Get content from the first slide
            const firstSlideContent = slides[0].content || '';
            // Strip HTML tags and get clean text
            const cleanText = firstSlideContent.replace(/<[^>]*>/g, '').trim();
            if (cleanText.length > 0) {
              excerpt = cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;
            }
          }
        } catch (error) {
          console.error('Error parsing story content for excerpt:', error);
        }
        
        return {
          ...story,
          excerpt
        };
      });
      
      return NextResponse.json({ 
        success: true,
        stories: processedStories 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching published web stories:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch web stories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

