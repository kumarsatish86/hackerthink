import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaChartLine } from 'react-icons/fa';
import { query } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Datasets Used in Benchmarks - HackerThink',
  description:
    'Discover datasets used in AI benchmarks and evaluations. Browse catalog entries tagged for evaluation tasks.',
  keywords: [
    'benchmark datasets',
    'evaluation datasets',
    'standard datasets',
    'AI benchmarks',
    'ML benchmarks',
    'test datasets',
  ].join(', '),
  openGraph: {
    title: 'Datasets Used in Benchmarks - HackerThink',
    description: 'Explore datasets used in AI benchmarks and evaluations.',
    type: 'website',
  },
  alternates: {
    canonical: '/datasets/benchmarks',
  },
};

async function getBenchmarkCatalog() {
  try {
    const result = await query(
      `SELECT name, slug, provider, dataset_type, domain, download_count, quality_score
       FROM datasets
       WHERE status = 'published'
         AND (
           domain ILIKE '%benchmark%'
           OR domain ILIKE '%evaluation%'
           OR dataset_type ILIKE '%benchmark%'
           OR name ILIKE '%GLUE%'
           OR name ILIKE '%ImageNet%'
           OR name ILIKE '%COCO%'
           OR name ILIKE '%SQuAD%'
           OR name ILIKE '%MMLU%'
           OR EXISTS (
             SELECT 1 FROM jsonb_array_elements_text(COALESCE(tags, '[]'::jsonb)) t
             WHERE t ILIKE '%benchmark%' OR t ILIKE '%eval%'
           )
         )
       ORDER BY download_count DESC NULLS LAST
       LIMIT 24`
    );
    return result.rows as {
      name: string;
      slug: string;
      provider?: string;
      dataset_type?: string;
      domain?: string;
      download_count?: number;
      quality_score?: number;
    }[];
  } catch {
    return [];
  }
}

export default async function DatasetsBenchmarksPage() {
  const catalog = await getBenchmarkCatalog();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/datasets"
            className="mb-4 inline-flex items-center text-red-100 transition-colors hover:text-white"
          >
            <FaArrowLeft className="mr-2" /> Back to All Datasets
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white bg-opacity-20">
              <FaChartLine className="h-10 w-10" />
            </div>
            <div>
              <h1 className="mb-2 text-4xl font-bold md:text-5xl">Benchmark Datasets</h1>
              <p className="text-xl text-red-100">Datasets used in AI benchmarks and evaluations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">About Benchmark Datasets</h2>
          <p className="mb-4 text-gray-700">
            Benchmark datasets are standardized corpora used to evaluate and compare AI models. They provide a
            common ground for measuring capabilities across tasks and domains.
          </p>
          <h3 className="mb-3 mt-6 text-xl font-bold">Common Benchmark Categories</h3>
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li>
              <strong>Language Understanding:</strong> GLUE, SuperGLUE, SQuAD, RACE
            </li>
            <li>
              <strong>Language Generation:</strong> WikiText, Penn Treebank, Common Crawl
            </li>
            <li>
              <strong>Computer Vision:</strong> ImageNet, COCO, CIFAR-10/100
            </li>
            <li>
              <strong>Code Generation:</strong> HumanEval, MBPP, APPS
            </li>
            <li>
              <strong>Reasoning:</strong> GSM8K, MATH, ARC, HellaSwag
            </li>
            <li>
              <strong>Multimodal:</strong> VQAv2, MS-COCO, Conceptual Captions
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Catalog matches</h2>
            <Link href="/datasets?domain=benchmark" className="text-sm font-medium text-red-600 hover:underline">
              Browse full catalog →
            </Link>
          </div>
          {catalog.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((d) => (
                <li key={d.slug} className="rounded-lg border border-gray-200 p-4">
                  <Link href={`/datasets/${d.slug}`} className="font-semibold text-red-700 hover:underline">
                    {d.name}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">
                    {d.provider || 'Unknown'} · {d.dataset_type || d.domain || 'Dataset'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              No tagged benchmark entries yet. Import evaluation datasets or add{' '}
              <code className="rounded bg-gray-100 px-1">benchmark</code> tags / domain.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
