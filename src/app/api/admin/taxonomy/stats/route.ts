import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch categories from all sources (same logic as categories endpoint)
    let tutorialCategoriesCount = 0;
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM tutorial_categories
      `);
      tutorialCategoriesCount = parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error fetching tutorial categories:', error);
    }

    let newsCategoriesCount = 0;
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM news_categories
      `);
      newsCategoriesCount = parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error fetching news categories:', error);
    }

    let articleCategoriesCount = 0;
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM categories
      `);
      articleCategoriesCount = parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error fetching article categories:', error);
    }

    // Count distinct command categories
    let commandCategoriesCount = 0;
    try {
      const result = await pool.query(`
        SELECT COUNT(DISTINCT category) as count
        FROM commands 
        WHERE category IS NOT NULL AND category != '' AND published = true
      `);
      commandCategoriesCount = parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error fetching command categories:', error);
    }

    // Count distinct product categories from JSONB array
    let productCategoriesCount = 0;
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'products'
        )
      `);
      
      if (tableExists.rows[0].exists) {
        const result = await pool.query(`
          SELECT COUNT(DISTINCT category) as count
          FROM (
            SELECT jsonb_array_elements_text(categories) as category
            FROM products
            WHERE categories IS NOT NULL 
              AND jsonb_typeof(categories) = 'array'
              AND jsonb_array_length(categories) > 0
              AND status = 'published'
          ) AS expanded_categories
          WHERE category IS NOT NULL AND category != ''
        `);
        productCategoriesCount = parseInt(result.rows[0]?.count || '0');
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
    }

    // Calculate total categories
    const totalCategories = tutorialCategoriesCount + newsCategoriesCount + articleCategoriesCount + commandCategoriesCount + productCategoriesCount;

    // Build categories_by_type object
    const categoriesByType: { [key: string]: number } = {};
    if (tutorialCategoriesCount > 0) categoriesByType.tutorials = tutorialCategoriesCount;
    if (newsCategoriesCount > 0) categoriesByType.news = newsCategoriesCount;
    if (articleCategoriesCount > 0) categoriesByType.articles = articleCategoriesCount;
    if (commandCategoriesCount > 0) categoriesByType.commands = commandCategoriesCount;
    if (productCategoriesCount > 0) categoriesByType.products = productCategoriesCount;

    // TODO: Fetch actual tag counts from database
    // For now, using placeholder values
    const stats = {
      total_categories: totalCategories,
      total_tags: 45, // TODO: Calculate actual tag count
      categories_by_type: categoriesByType,
      tags_by_type: {
        articles: 18,
        courses: 8,
        tutorials: 0,
        tools: 4,
        glossary: 2,
        commands: 0,
        news: 0,
        interviews: 0,
        quizzes: 0,
        products: 0
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching taxonomy stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

