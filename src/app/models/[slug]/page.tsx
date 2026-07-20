import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { getModelDetailBySlug } from '@/lib/models/getModelDetail';
import { generateModelSummary } from '@/lib/models/generateModelSummary';
import { generatePeopleAlsoAsk } from '@/lib/models/generatePeopleAlsoAsk';
import { ModelsThemeProvider } from '@/components/models/ModelsThemeProvider';
import { ModelDetailView } from '@/components/models/detail/ModelDetailView';
import '@/styles/ht-tokens.css';
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
  architecture: string | null;
  parameters: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  status: string | null;
}

async function getModelMeta(slug: string): Promise<ModelMetaRow | undefined> {
  return queryOne(
    `SELECT name, slug, description, developer, task, model_type, license, logo_url,
            architecture, parameters, seo_title, seo_description, seo_keywords, status
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

  const fallbackDesc = generateModelSummary({
    id: '',
    name: model.name,
    slug: model.slug,
    developer: model.developer,
    description: model.description,
    task: model.task,
    model_type: model.model_type,
    license: model.license,
    architecture: model.architecture,
    parameters: model.parameters,
  });

  const title = model.seo_title || `${model.name} — Specs, Install, Benchmarks | HackerThink`;
  const rawDesc =
    model.seo_description ||
    model.description ||
    fallbackDesc;
  const description = rawDesc.replace(/^no description available$/i, fallbackDesc).slice(0, 300);
  const canonical = `/models/${slug}`;
  const ogImage = `/api/models/og?slug=${encodeURIComponent(slug)}`;
  const keywords =
    model.seo_keywords ||
    [model.name, model.task, model.model_type, model.license, 'AI model', 'HackerThink']
      .filter(Boolean)
      .join(', ');

  return {
    title,
    description,
    keywords,
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
    ...(model.description
      ? { description: model.description }
      : { description: generateModelSummary(model) }),
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

  const faqEntities =
    faqs.length > 0
      ? faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        }))
      : generatePeopleAlsoAsk(model).map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        }));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntities,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Models', item: `${siteUrl}/models` },
      { '@type': 'ListItem', position: 3, name: model.name, item: canonicalUrl },
    ],
  };

  const datasetSchema =
    payload.training_data.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: `${model.name} training data`,
          description: `Training datasets associated with ${model.name}`,
          url: canonicalUrl,
          creator: model.developer ? { '@type': 'Organization', name: model.developer } : undefined,
        }
      : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: model.name,
    description: model.description || generateModelSummary(model),
    url: canonicalUrl,
    author: model.developer ? { '@type': 'Organization', name: model.developer } : undefined,
    dateModified: model.last_updated || undefined,
    datePublished: model.release_date || undefined,
    mainEntityOfPage: canonicalUrl,
  };

  const relatedLinks = payload.related
    .filter((r) => r.url || r.slug)
    .slice(0, 12)
    .map((r) => ({
      '@type': 'WebPage',
      name: r.title,
      url: r.url || `${siteUrl}/${r.type === 'model' ? 'models' : r.type}/${r.slug}`,
    }));

  return (
    <ModelsThemeProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {datasetSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {relatedLinks.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `Resources related to ${model.name}`,
              itemListElement: relatedLinks.map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item,
              })),
            }),
          }}
        />
      )}
      <ModelDetailView initialData={payload} />
    </ModelsThemeProvider>
  );
}
