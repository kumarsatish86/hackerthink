'use client';

import { Quiz, QuizAnalytics as QuizAnalyticsType } from '@/types/quiz';
import { FaUsers, FaCheckCircle, FaChartLine, FaClock, FaTimesCircle } from 'react-icons/fa';

interface QuizAnalyticsProps {
  quiz: Quiz;
  analytics: QuizAnalyticsType;
}

export default function QuizAnalytics({ quiz, analytics }: QuizAnalyticsProps) {
  const stats = [
    {
      title: 'Total Attempts',
      value: analytics.total_attempts,
      icon: <FaUsers className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Completed',
      value: analytics.completed_attempts,
      icon: <FaCheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Average Score',
      value: `${analytics.average_score.toFixed(1)}%`,
      icon: <FaChartLine className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completion_rate.toFixed(1)}%`,
      icon: <FaCheckCircle className="w-6 h-6" />,
      color: 'indigo'
    },
    {
      title: 'Pass Rate',
      value: `${analytics.pass_rate.toFixed(1)}%`,
      icon: <FaCheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Avg Time',
      value: `${Math.round(analytics.average_time_taken / 60)}m`,
      icon: <FaClock className="w-6 h-6" />,
      color: 'yellow'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Distribution */}
      {analytics.score_distribution && analytics.score_distribution.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <div className="space-y-3">
            {analytics.score_distribution.map((dist, index) => {
              const percentage = analytics.completed_attempts > 0
                ? (dist.count / analytics.completed_attempts) * 100
                : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{dist.range}</span>
                    <span className="text-gray-600">{dist.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Frequently Missed Questions */}
      {analytics.frequently_missed_questions && analytics.frequently_missed_questions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Missed Questions</h3>
          <div className="space-y-4">
            {analytics.frequently_missed_questions.map((item, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div 
                      className="text-gray-900 mb-2"
                      dangerouslySetInnerHTML={{ 
                        __html: item.question_text.substring(0, 200) + (item.question_text.length > 200 ? '...' : '') 
                      }}
                    />
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {item.miss_percentage}% missed
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.miss_count} times
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempts Over Time */}
      {analytics.attempts_over_time && analytics.attempts_over_time.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attempts Over Time (Last 30 Days)</h3>
          <div className="space-y-2">
            {analytics.attempts_over_time.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ 
                          width: `${(item.count / Math.max(...analytics.attempts_over_time.map(a => a.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

