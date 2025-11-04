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

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/models/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/models/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/models/timeline`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quizzes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Category pages
  const categories = [
    'text-generation',
    'vision',
    'multimodal',
    'audio',
    'nlp',
    'code',
    'embeddings',
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/models/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Use case pages
  const useCases = [
    'chatbots',
    'code-generation',
    'text-generation',
    'image-generation',
    'translation',
    'summarization',
    'question-answering',
    'classification',
  ];

  const useCasePages: MetadataRoute.Sitemap = useCases.map(useCase => ({
    url: `${baseUrl}/models/use-cases/${useCase}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic model pages
  let modelPages: MetadataRoute.Sitemap = [];
  try {
    const result = await pool.query(
      `SELECT slug, updated_at FROM ai_models WHERE status = 'published' ORDER BY updated_at DESC LIMIT 10000`
    );

    modelPages = result.rows.map((model: any) => ({
      url: `${baseUrl}/models/${model.slug}`,
      lastModified: new Date(model.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching models for sitemap:', error);
  }

  // Organization pages (we can derive these from models or create a separate table)
  let orgPages: MetadataRoute.Sitemap = [];
  try {
    const orgResult = await pool.query(
      `SELECT DISTINCT developer FROM ai_models 
       WHERE status = 'published' AND developer IS NOT NULL 
       LIMIT 100`
    );

    orgPages = orgResult.rows.map((org: any) => ({
      url: `${baseUrl}/models/org/${org.developer.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching organizations for sitemap:', error);
  }

  // Interviews pages
  const interviewsPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/interviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic interview pages
  let interviewPages: MetadataRoute.Sitemap = [];
  try {
    const interviewResult = await pool.query(
      `SELECT slug, updated_at FROM interviews WHERE status = 'published' ORDER BY updated_at DESC LIMIT 10000`
    );

    interviewPages = interviewResult.rows.map((interview: any) => ({
      url: `${baseUrl}/interviews/${interview.slug}`,
      lastModified: new Date(interview.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching interviews for sitemap:', error);
  }

  // Guest profile pages
  let guestPages: MetadataRoute.Sitemap = [];
  try {
    const guestResult = await pool.query(
      `SELECT slug, updated_at FROM interview_guests ORDER BY updated_at DESC LIMIT 1000`
    );

    guestPages = guestResult.rows.map((guest: any) => ({
      url: `${baseUrl}/interviews/guest/${guest.slug}`,
      lastModified: new Date(guest.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching guests for sitemap:', error);
  }

  // Get published quizzes
  let quizPages: MetadataRoute.Sitemap = [];
  try {
    // Check if quizzes table exists and has slug column
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes'
      )
    `);
    
    if (tableCheck.rows[0].exists) {
      // Check if slug column exists
      const columnCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'quizzes' 
          AND column_name = 'slug'
        )
      `);
      
      if (columnCheck.rows[0].exists) {
        const { rows: quizzes } = await pool.query(`
          SELECT slug, updated_at 
          FROM quizzes 
          WHERE status = 'published'
          ORDER BY created_at DESC
          LIMIT 1000
        `);
        
        quizPages = quizzes.map((quiz: any) => ({
          url: `${baseUrl}/quizzes/${quiz.slug}`,
          lastModified: quiz.updated_at ? new Date(quiz.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching quizzes for sitemap:', error);
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...useCasePages,
    ...modelPages,
    ...orgPages,
    ...interviewsPages,
    ...interviewPages,
    ...guestPages,
    ...quizPages,
  ];
}

