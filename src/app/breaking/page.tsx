import { Metadata } from 'next';
import CategoryNewsList from '@/components/news/CategoryNewsList';

export const metadata: Metadata = {
  title: 'Breaking News - HackerThink',
  description: 'Latest breaking news and urgent updates',
};

export default function BreakingPage() {
  return <CategoryNewsList categorySlug="breaking" categoryName="Breaking News" />;
}

