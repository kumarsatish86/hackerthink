import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { getModelDetailBySlug } from '@/lib/models/getModelDetail';
import { ModelsThemeProvider } from '@/components/models/ModelsThemeProvider';
import { ModelDetailView } from '@/components/models/detail/ModelDetailView';
import '@/styles/models.css';

export const dynamic = 'force-dynamic';

interface ModelMetaRow {
  name: string;
  slug: string;
  description: string | null;
  developer: string | null;
  task: string | null;
  model_type: string | null;
  license: string | null;
  logo_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  status: string | null;
}

async function getModelMeta(slug: string): Promise<ModelMetaRow | undefined> {
  return queryOne(
    `SELECT name, slug, description, developer, task, model_type, license, logo_url,
            seo_title, seo_description, seo_keywords, status
     FROM ai_models WHERE slug = $1 LIMIT 1`,
    [slug]
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelMeta(slug);

  if (!model || model.status !== 'published') {
    return {
      title: 'Model Not Found - HackerThink',
      description: 'The requested AI model could not be found.',
    };
  }

  const title = model.seo_title || `${model.name} - AI Model | HackerThink`;
  const description =
    model.seo_description ||
    model.description ||
    `${model.name} — ${model.model_type || model.task || 'AI model'}${model.developer ? ` by ${model.developer}` : ''}. Specs, benchmarks, installation guides, and a live playground.`;
  const canonical = `/models/${slug}`;
  const ogImage = `/api/models/og?slug=${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    keywords: model.seo_keywords || undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: model.name }],
      ...(model.developer && { authors: [model.developer] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const meta = await getModelMeta(slug);
  if (!meta || meta.status !== 'published') {
    notFound();
  }

  const payload = await getModelDetailBySlug(slug);
  if (!payload) {
    notFound();
  }

  const { model, faqs } = payload;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackerthink.com';
  const canonicalUrl = `${siteUrl}/models/${slug}`;

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: model.name,
    ...(model.description && { description: model.description }),
    applicationCategory: 'AI Model',
    applicationSubCategory: model.model_type || model.task || 'General AI',
    operatingSystem: 'Cross-platform',
    url: canonicalUrl,
    ...(model.version && { softwareVersion: model.version }),
    ...(model.developer && { author: { '@type': 'Organization', name: model.developer } }),
    ...(model.release_date && { datePublished: model.release_date }),
    ...(model.license && { license: model.license }),
    ...(model.huggingface_url && { downloadUrl: model.huggingface_url }),
    ...(model.github_url && { codeRepository: model.github_url }),
    ...(model.rating && model.rating_count
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: model.rating,
            ratingCount: model.rating_count,
          },
        }
      : {}),
  };

  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Models', item: `${siteUrl}/models` },
      { '@type': 'ListItem', position: 3, name: model.name, item: canonicalUrl },
    ],
  };

  return (
    <ModelsThemeProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ModelDetailView initialData={payload} />
    </ModelsThemeProvider>
  );
}
