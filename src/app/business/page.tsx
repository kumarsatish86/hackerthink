import { Metadata } from 'next';
import CategoryNewsList from '@/components/news/CategoryNewsList';

export const metadata: Metadata = {
  title: 'Business News - HackerThink',
  description: 'Business news and market updates',
};

export default function BusinessPage() {
  return <CategoryNewsList categorySlug="business" categoryName="Business" />;
}

