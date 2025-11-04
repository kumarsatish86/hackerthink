interface PullQuoteProps {
  quote: string;
  author?: string;
  className?: string;
}

export default function PullQuote({ quote, author, className = '' }: PullQuoteProps) {
  return (
    <blockquote className={`border-l-4 border-indigo-500 pl-6 py-4 my-6 ${className}`}>
      <p className="text-xl font-medium text-gray-900 italic mb-2">
        "{quote}"
      </p>
      {author && (
        <cite className="text-sm text-gray-600 not-italic">
          — {author}
        </cite>
      )}
    </blockquote>
  );
}

