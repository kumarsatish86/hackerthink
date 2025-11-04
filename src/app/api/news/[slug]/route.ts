import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First, check what columns exist in the news table
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'news'
    `);
    
    const columnNames = columnInfo.map(col => col.column_name);
    
    // Build a query dynamically
    let selectClause = [`n.id`, `n.title`, `n.slug`, `n.content`];
    
    // Add optional columns if they exist
    if (columnNames.includes('excerpt')) selectClause.push(`n.excerpt`);
    if (columnNames.includes('author_id')) selectClause.push(`n.author_id`);
    if (columnNames.includes('status')) selectClause.push(`n.status`);
    if (columnNames.includes('featured_image')) selectClause.push(`n.featured_image`);
    if (columnNames.includes('featured_image_alt')) selectClause.push(`n.featured_image_alt`);
    if (columnNames.includes('category_id')) selectClause.push(`n.category_id`);
    if (columnNames.includes('schedule_date')) selectClause.push(`n.schedule_date`);
    if (columnNames.includes('publish_date')) selectClause.push(`n.publish_date`);
    if (columnNames.includes('tags')) selectClause.push(`n.tags`);
    if (columnNames.includes('meta_title')) selectClause.push(`n.meta_title`);
    if (columnNames.includes('meta_description')) selectClause.push(`n.meta_description`);
    if (columnNames.includes('seo_keywords')) selectClause.push(`n.seo_keywords`);
    if (columnNames.includes('schema_json')) selectClause.push(`n.schema_json`);
    if (columnNames.includes('created_at')) selectClause.push(`n.created_at`);
    if (columnNames.includes('updated_at')) selectClause.push(`n.updated_at`);
    
    // Build from clause and joins
    let fromClause = `FROM news n`;
    let joinClauses = [];
    
    // Add author join if author_id exists
    if (columnNames.includes('author_id')) {
      joinClauses.push(`LEFT JOIN users u ON n.author_id = u.id`);
      selectClause.push(`u.name as author_name`);
    }
    
    // Add category join if category_id exists
    if (columnNames.includes('category_id')) {
      joinClauses.push(`LEFT JOIN news_categories nc ON n.category_id = nc.id`);
      selectClause.push(`nc.name as category_name`);
    }
    
    // Build the complete query
    const query = `
      SELECT ${selectClause.join(', ')}
      ${fromClause}
      ${joinClauses.join(' ')}
      WHERE n.slug = $1 AND n.status = 'published'
    `;
    
    console.log('Generated query:', query);
    
    // Fetch news from database
    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'News article not found' }, { status: 404 });
    }

    const newsItem = rows[0];

    // Parse tags if they exist
    if (newsItem.tags && typeof newsItem.tags === 'string') {
      try {
        newsItem.tags = JSON.parse(newsItem.tags);
      } catch (e) {
        newsItem.tags = [];
      }
    } else if (!newsItem.tags) {
      newsItem.tags = [];
    }

    return NextResponse.json({ news: newsItem });
  } catch (error) {
    console.error('Error fetching news article:', error);

    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
