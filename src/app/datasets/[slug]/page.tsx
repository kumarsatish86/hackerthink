import { Metadata } from 'next';
import DatasetDetailClient from '@/components/datasets/DatasetDetailClient';
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
      `SELECT name, description, seo_title, seo_description, provider, dataset_type, license, version
       FROM datasets WHERE slug = $1 AND status = 'published'`,
      [params.slug]
    );

    if (result.rows.length === 0) {
      return {
        title: 'Dataset Not Found - HackerThink',
        description: 'The dataset you are looking for does not exist.',
      };
    }

    const dataset = result.rows[0];
    const title = dataset.seo_title || `${dataset.name} Dataset - HackerThink`;
    const description = dataset.seo_description || 
      dataset.description || 
      `${dataset.name} - ${dataset.dataset_type || 'AI'} dataset by ${dataset.provider || 'various contributors'}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        ...(dataset.provider && {
          siteName: dataset.provider,
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Dataset - HackerThink',
      description: 'View details of this dataset',
    };
  }
}

export default function DatasetDetailPage({ params }: { params: { slug: string } }) {
  return <DatasetDetailClient slug={params.slug} />;
}

