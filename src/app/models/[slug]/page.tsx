import { Metadata } from 'next';
import ModelDetailClient from '@/components/models/ModelDetailClient';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const result = await pool.query(
      `SELECT name, description, developer, model_type, parameters, license, download_count 
       FROM ai_models 
       WHERE slug = $1 AND status = 'published'`,
      [params.slug]
    );

    if (result.rows.length === 0) {
      return {
        title: `Model Not Found - HackerThink`,
        description: 'The requested AI model could not be found.',
      };
    }

    const model = result.rows[0];
    const title = `${model.name} - AI Model | HackerThink`;
    const description = model.description 
      ? `${model.description.substring(0, 160)}...` 
      : `${model.name} - ${model.model_type || 'General'} AI model${model.parameters ? ` with ${model.parameters} parameters` : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        ...(model.developer && { authors: [model.developer] }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      keywords: [
        model.name,
        model.model_type || 'AI model',
        ...(model.developer ? [model.developer] : []),
        ...(model.parameters ? [`${model.parameters} parameters`] : []),
        ...(model.license ? [`${model.license} license`] : []),
        'artificial intelligence',
        'machine learning',
      ].join(', '),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `AI Model - HackerThink`,
      description: 'View details of this AI model',
    };
  }
}

export default function ModelDetailPage({ params }: { params: { slug: string } }) {
  return <ModelDetailClient slug={params.slug} />;
}

