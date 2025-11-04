import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { articleId, schemaJson } = data;
    
    if (!articleId) {
      return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
    }
    
    // Set a default schema if not provided
    const schema = schemaJson || JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Test Article",
      "description": "This is a test description for debugging",
      "author": {
        "@type": "Person",
        "name": "Debug User"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HackerThink"
      },
      "datePublished": new Date().toISOString()
    });
    
    // Update the article with the schema_json
    const { rowCount } = await pool.query(
      'UPDATE articles SET schema_json = $1 WHERE id = $2',
      [schema, articleId]
    );
    
    if (rowCount === 0) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }
    
    // Fetch the updated article to verify the schema_json was saved
    const { rows } = await pool.query(
      'SELECT id, title, schema_json FROM articles WHERE id = $1',
      [articleId]
    );
    
    return NextResponse.json({
      message: 'Schema JSON updated successfully',
      article: rows[0]
    });
  } catch (error) {
    console.error('Error updating schema_json:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
