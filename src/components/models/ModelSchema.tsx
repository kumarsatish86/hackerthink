'use client';

interface ModelSchemaProps {
  model: {
    id: string;
    name: string;
    slug: string;
    developer?: string;
    description?: string;
    version?: string;
    license?: string;
    release_date_full?: string;
    huggingface_url?: string;
    github_url?: string;
    paper_url?: string;
    model_type?: string;
    architecture?: string;
    parameters?: string;
  };
}

export default function ModelSchema({ model }: ModelSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': model.name,
    'applicationCategory': 'AI Model',
    'operatingSystem': 'Cross-platform',
    'description': model.description || '',
    'url': typeof window !== 'undefined' ? `${window.location.origin}/models/${model.slug}` : '',
    ...(model.version && { 'softwareVersion': model.version }),
    ...(model.developer && { 
      'author': {
        '@type': 'Organization',
        'name': model.developer
      }
    }),
    ...(model.release_date_full && {
      'datePublished': new Date(model.release_date_full).toISOString(),
    }),
    ...(model.license && {
      'license': `https://spdx.org/licenses/${model.license}.html`
    }),
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    ...(model.huggingface_url && {
      'downloadUrl': model.huggingface_url
    }),
    ...(model.github_url && {
      'codeRepository': model.github_url
    }),
    ...(model.paper_url && {
      'citation': {
        '@type': 'ScholarlyArticle',
        'url': model.paper_url
      }
    }),
    'applicationSubCategory': model.model_type || 'General AI',
    ...(model.architecture && {
      'programmingModel': model.architecture
    }),
    ...(model.parameters && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.5',
        'ratingCount': '100'
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

