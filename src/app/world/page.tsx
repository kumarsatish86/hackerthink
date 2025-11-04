import { Metadata } from 'next';
import CategoryNewsList from '@/components/news/CategoryNewsList';

export const metadata: Metadata = {
  title: 'World News - HackerThink',
  description: 'International news and global events',
};

export default function WorldPage() {
  return <CategoryNewsList categorySlug="global-news" categoryName="World" />;
}

