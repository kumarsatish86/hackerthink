import { Metadata } from 'next';
import CategoryNewsList from '@/components/news/CategoryNewsList';

export const metadata: Metadata = {
  title: 'Tech News - HackerThink',
  description: 'Latest technology news and innovations',
};

export default function TechPage() {
  return <CategoryNewsList categorySlug="technology" categoryName="Tech" />;
}

