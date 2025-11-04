import PullQuote from './PullQuote';
import FormattedContent from '../FormattedContent';

interface QAItem {
  id: string;
  section: string;
  question: string;
  answer: string;
  isHighlight?: boolean;
  isQuote?: boolean;
}

interface InterviewQASectionProps {
  qaItems: QAItem[];
  sections?: string[];
}

export default function InterviewQASection({ qaItems, sections }: InterviewQASectionProps) {
  const defaultSections = ['Background', 'Technical', 'Opinion', 'Advice', 'Future of AI', 'General'];
  const sectionsToUse = sections || defaultSections;

  // Group Q&A items by section
  const itemsBySection = sectionsToUse.reduce((acc, section) => {
    acc[section] = qaItems.filter(item => item.section === section);
    return acc;
  }, {} as Record<string, QAItem[]>);

  return (
    <div className="space-y-8">
      {sectionsToUse.map(section => {
        const items = itemsBySection[section];
        if (!items || items.length === 0) return null;

        return (
          <div key={section} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
              {section}
            </h2>
            
            {items.map((item, index) => (
              <div key={item.id} className="space-y-3">
                {item.isQuote && item.answer ? (
                  <PullQuote quote={item.answer} />
                ) : (
                  <>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 pl-4 py-2 rounded-r">
                      <h3 className="font-semibold text-gray-900">
                        {item.question}
                      </h3>
                    </div>
                    
                    <div className={`pl-4 ${item.isHighlight ? 'bg-yellow-50 border-l-4 border-yellow-400 py-2 rounded-r' : ''}`}>
                      <FormattedContent content={item.answer} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

