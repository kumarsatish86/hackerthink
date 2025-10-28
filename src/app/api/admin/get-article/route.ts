import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(request: NextRequest) {
  try {
    // Get article ID from query string
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('id') || '1'; // Default to 1 if not provided
    
    // Use a very simple query
    const { rows } = await pool.query(
      'SELECT * FROM articles WHERE id = $1::integer',
      [articleId]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Article found successfully',
      article: rows[0]
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({
      message: 'Failed to fetch article',
      error: String(error)
    }, { status: 500 });
  }
} 
