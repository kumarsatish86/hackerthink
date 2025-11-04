import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RSS Feeds - HackerThink',
  description: 'Subscribe to our RSS feeds for the latest news and updates',
};

export default function RSSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

