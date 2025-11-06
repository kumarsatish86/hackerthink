import { MetadataRoute } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackerthink.com';

  // Get sitemap settings from database
  let includeInSitemap: string[] = [];

  try {
    const settingsResult = await pool.query(`
      SELECT setting_key, setting_value
      FROM seo_settings
      WHERE setting_key IN (
        'generate_sitemap',
        'include_in_sitemap'
      )
    `);

    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {} as Record<string, string>);

    // Check if sitemap generation is enabled
    if (settings.generate_sitemap === 'false') {
      return [];
    }

    // Get included content types
    if (settings.include_in_sitemap) {
      includeInSitemap = settings.include_in_sitemap.split(',').map((t: string) => t.trim());
    }
  } catch (error) {
    console.error('Error fetching sitemap settings:', error);
    // Continue with defaults if settings can't be fetched
  }

  // Helper function to check if content type is included
  const isIncluded = (type: string) => {
    return includeInSitemap.length === 0 || includeInSitemap.includes(type);
  };

  // Build sitemap index - list of individual sitemap files
  const sitemapIndex: MetadataRoute.Sitemap = [];

  // Add individual content type sitemaps based on include_in_sitemap setting
  if (isIncluded('articles')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/articles.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('news')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/news.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('ai-models')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/ai-models.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  if (isIncluded('ai-datasets')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/ai-datasets.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('quizzes')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/quizzes.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('interviews')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/interviews.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('commands')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/commands.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('tutorials')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/tutorials.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('lessons')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/lessons.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('tools')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/tools.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('lab-exercises')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/lab-exercises.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('web-stories')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/web-stories.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('courses')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/courses.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  if (isIncluded('scripts')) {
    sitemapIndex.push({
      url: `${baseUrl}/sitemaps/scripts.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  return sitemapIndex;
}

