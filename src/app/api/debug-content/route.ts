import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
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
