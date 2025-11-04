import { Metadata } from 'next';
import CategoryNewsList from '@/components/news/CategoryNewsList';

export const metadata: Metadata = {
  title: 'Opinion - HackerThink',
  description: 'Opinion pieces and editorials',
};

export default function OpinionPage() {
  return <CategoryNewsList categorySlug="opinion" categoryName="Opinion" />;
}

