import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { getDatasetDetailBySlug } from '@/lib/datasets/getDatasetDetail';
import { generateDatasetSummary } from '@/lib/datasets/generateDatasetSummary';
import { generatePeopleAlsoAsk } from '@/lib/datasets/generatePeopleAlsoAsk';
import { DatasetsThemeProvider } from '@/components/datasets/DatasetsThemeProvider';
import { DatasetDetailView } from '@/components/datasets/detail/DatasetDetailView';
import '@/styles/ht-tokens.css';

export const dynamic = 'force-dynamic';

async function getMeta(slug: string) {
  return queryOne(
    `SELECT name, slug, description, seo_title, seo_description, seo_keywords, provider, dataset_type, license, version, status
     FROM datasets WHERE slug = $1 LIMIT 1`,
    [slug]
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getMeta(slug);
  if (!row || row.status !== 'published') {
    return { title: 'Dataset Not Found - HackerThink', description: 'Dataset not found.' };
  }
  const fallback = generateDatasetSummary(row as any);
  const title = row.seo_title || `${row.name} Dataset — Specs, Download, Explorer | HackerThink`;
  const description = (row.seo_description || row.description || fallback).slice(0, 300);
  const canonical = `/datasets/${slug}`;
  return {
    title,
    description,
    keywords: row.seo_keywords || undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: [{ url: `/api/datasets/og?slug=${encodeURIComponent(slug)}`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function DatasetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getDatasetDetailBySlug(slug);
  if (!payload) notFound();

  const { dataset, faqs } = payload;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackerthink.com';
  const canonicalUrl = `${siteUrl}/datasets/${slug}`;

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: dataset.name,
    description: dataset.description || generateDatasetSummary(dataset),
    url: canonicalUrl,
    license: dataset.license || undefined,
    creator: dataset.provider ? { '@type': 'Organization', name: dataset.provider } : undefined,
    dateModified: dataset.last_updated || undefined,
    datePublished: dataset.release_date || undefined,
    distribution: dataset.download_url
      ? { '@type': 'DataDownload', contentUrl: dataset.download_url }
      : undefined,
  };

  const faqEntities = (faqs.length ? faqs : generatePeopleAlsoAsk(dataset)).map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  }));

  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntities };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Datasets', item: `${siteUrl}/datasets` },
      { '@type': 'ListItem', position: 3, name: dataset.name, item: canonicalUrl },
    ],
  };

  return (
    <DatasetsThemeProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DatasetDetailView initialData={payload} />
    </DatasetsThemeProvider>
  );
}
