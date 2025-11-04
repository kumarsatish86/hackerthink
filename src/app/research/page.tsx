import { Metadata } from 'next';
import CategoryNewsList from '@/components/news/CategoryNewsList';

export const metadata: Metadata = {
  title: 'Research - HackerThink',
  description: 'Scientific research and academic news',
};

export default function ResearchPage() {
  return <CategoryNewsList categorySlug="research" categoryName="Research" />;
}

