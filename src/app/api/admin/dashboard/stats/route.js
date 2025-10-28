import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

// Add roadmap count to the stats query
const statsQueries = [
  { name: 'totalArticles', query: 'SELECT COUNT(*) FROM articles' },
  { name: 'totalCommands', query: 'SELECT COUNT(*) FROM commands' },
  { name: 'totalCourses', query: 'SELECT COUNT(*) FROM courses' },
  { name: 'totalTools', query: 'SELECT COUNT(*) FROM tools' },
  { name: 'totalRoadmaps', query: 'SELECT COUNT(*) FROM roadmaps' }
];

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get stats from database
    const stats = {};

    // Run all queries in parallel
    await Promise.all(
      statsQueries.map(async ({ name, query: queryString }) => {
        try {
          const result = await query(queryString);
          stats[name] = parseInt(result.rows[0].count, 10);
        } catch (error) {
          console.error(`Error fetching ${name}:`, error);
          stats[name] = 0;
        }
      })
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 
