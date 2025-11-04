import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function POST() {
  try {
    const client = await pool.connect();
    
    try {
      // Check if the tool already exists
      const checkResult = await client.query(
        'SELECT id FROM tools WHERE slug = $1',
        ['chmod-explainer-tool']
      );
      
      if (checkResult.rows.length > 0) {
        return NextResponse.json({ 
          message: 'Chmod Explainer Tool already exists',
          tool: checkResult.rows[0]
        });
      }
      
      // Insert the chmod explainer tool
      const insertResult = await client.query(
        `INSERT INTO tools 
         (title, slug, description, icon, file_path, published, seo_title, seo_description, seo_keywords, category, platform, license, popularity) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [
          'Chmod Explainer Tool',
          'chmod-explainer-tool',
          'Convert numeric chmod permissions (e.g., 755) to symbolic notation (e.g., rwxr-xr-x) and vice versa. Understand Linux file permissions with detailed explanations.',
          'file-lock',
          '/tools/chmod-explainer-tool',
          true,
          'Linux Chmod Explainer Tool - Convert Numeric to Symbolic Permissions',
          'Convert between numeric (755) and symbolic (rwxr-xr-x) chmod permissions. Learn Linux file permissions with detailed explanations and examples.',
          'chmod, linux, file permissions, numeric permissions, symbolic permissions, rwx, 755, 644, file access, linux security',
          'file-permissions',
          'linux',
          'MIT',
          85
        ]
      );
      
      return NextResponse.json({ 
        message: 'Chmod Explainer Tool created successfully',
        tool: insertResult.rows[0]
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating Chmod Explainer Tool:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}

