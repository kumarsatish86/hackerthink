import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:123456@localhost:5432/ainews',
});

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query('SELECT id, title, content FROM articles WHERE id = 1');
    const article = result.rows[0];
    
    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        content: article.content
      }
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch content' 
    }, { status: 500 });
  }
} 
