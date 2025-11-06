import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get published articles
    const articlesResult = await pool.query(
      `SELECT 
        a.id::text as id,
        a.title,
        a.slug,
        a.excerpt,
        a.featured_image,
        a.created_at,
        a.updated_at,
        u.name as author_name,
        c.name as category_name,
        c.slug as category_slug,
        'article' as source_type
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true
      ORDER BY a.created_at DESC`
    );

    // Get published news items
    const newsResult = await pool.query(
      `SELECT 
        n.id::text as id,
        n.title,
        n.slug,
        n.excerpt,
        n.featured_image,
        n.created_at,
        n.updated_at,
        u.name as author_name,
        nc.name as category_name,
        nc.slug as category_slug,
        'news' as source_type
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE n.status = 'published'
      ORDER BY n.created_at DESC`
    );

    // Combine both results and sort by created_at
    const allItems = [...articlesResult.rows, ...newsResult.rows].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    // Get top story (most recent published item)
    const topStory = allItems.length > 0 ? allItems[0] : null;

    // Get breaking news (recent published items, excluding top story)
    const breakingNews = allItems.slice(1, 7);

    // Get items by category from both tables
    const categories = ['Tech', 'Business', 'Research', 'Opinion', 'World'];
    const categoryArticles: Record<string, any[]> = {};

    for (const category of categories) {
      const categoryItems = allItems.filter(item => {
        const categoryName = item.category_name || '';
        const categorySlug = item.category_slug || '';
        return categoryName.toLowerCase().includes(category.toLowerCase()) ||
               categorySlug.toLowerCase().includes(category.toLowerCase());
      }).slice(0, 3);
      categoryArticles[category] = categoryItems;
    }

    // Get latest news (all published items)
    const latestNews = allItems.slice(0, 10);

    // Get trending topics from both tables
    const trendingMap = new Map<string, number>();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    allItems.forEach(item => {
      const itemDate = new Date(item.created_at);
      if (itemDate >= sevenDaysAgo && item.category_name) {
        const count = trendingMap.get(item.category_name) || 0;
        trendingMap.set(item.category_name, count + 1);
      }
    });

    const trendingTopics = Array.from(trendingMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    // Format all data
    const formatArticle = (article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      image: article.featured_image || '',
      category: article.category_name || 'General',
      categorySlug: article.category_slug || '',
      author: article.author_name || 'AI News Staff',
      time: formatTimeAgo(new Date(article.created_at)),
      created_at: article.created_at,
      updated_at: article.updated_at,
      sourceType: article.source_type || 'article', // Track if it's from articles or news table
    });

    const formattedTopStory = topStory ? formatArticle(topStory) : null;
    const formattedBreakingNews = breakingNews.map(formatArticle);
    const formattedLatestNews = latestNews.map(formatArticle);
    
    const formattedTechNews = (categoryArticles['Tech'] || []).map(formatArticle);
    const formattedBusinessNews = (categoryArticles['Business'] || []).map(formatArticle);
    const formattedResearchNews = (categoryArticles['Research'] || []).map(formatArticle);
    const formattedOpinionNews = (categoryArticles['Opinion'] || []).map(formatArticle);
    const formattedWorldNews = (categoryArticles['World'] || []).map(formatArticle);

    // Quick News - get latest 3 items
    const formattedQuickNews = latestNews.slice(0, 3).map(formatArticle);

    return NextResponse.json({
      topStory: formattedTopStory,
      breakingNews: formattedBreakingNews,
      latestNews: formattedLatestNews,
      techNews: formattedTechNews,
      businessNews: formattedBusinessNews,
      researchNews: formattedResearchNews,
      opinionNews: formattedOpinionNews,
      worldNews: formattedWorldNews,
      trendingTopics,
      quickNews: formattedQuickNews,
    });
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

