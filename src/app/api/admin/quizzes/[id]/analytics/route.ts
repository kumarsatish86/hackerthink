import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if quiz exists
    const quizCheck = await pool.query('SELECT id, title, passing_score FROM quizzes WHERE id = $1', [id]);
    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizCheck.rows[0];
    const passingScore = quiz.passing_score || 70;

    // Get total attempts
    const totalAttemptsResult = await pool.query(
      'SELECT COUNT(*) as total FROM quiz_attempts WHERE quiz_id = $1',
      [id]
    );
    const totalAttempts = parseInt(totalAttemptsResult.rows[0].total) || 0;

    // Get completed attempts
    const completedAttemptsResult = await pool.query(
      'SELECT COUNT(*) as total FROM quiz_attempts WHERE quiz_id = $1 AND is_completed = true',
      [id]
    );
    const completedAttempts = parseInt(completedAttemptsResult.rows[0].total) || 0;

    // Get average score
    const avgScoreResult = await pool.query(
      'SELECT AVG(score) as avg_score FROM quiz_attempts WHERE quiz_id = $1 AND is_completed = true AND score IS NOT NULL',
      [id]
    );
    const averageScore = avgScoreResult.rows[0].avg_score 
      ? parseFloat(avgScoreResult.rows[0].avg_score).toFixed(2)
      : 0;

    // Get completion rate
    const completionRate = totalAttempts > 0 
      ? ((completedAttempts / totalAttempts) * 100).toFixed(2)
      : 0;

    // Get pass rate
    const passAttemptsResult = await pool.query(
      'SELECT COUNT(*) as total FROM quiz_attempts WHERE quiz_id = $1 AND is_completed = true AND score >= $2',
      [id, passingScore]
    );
    const passAttempts = parseInt(passAttemptsResult.rows[0].total) || 0;
    const passRate = completedAttempts > 0
      ? ((passAttempts / completedAttempts) * 100).toFixed(2)
      : 0;

    // Get average time taken
    const avgTimeResult = await pool.query(
      'SELECT AVG(time_taken) as avg_time FROM quiz_attempts WHERE quiz_id = $1 AND is_completed = true AND time_taken IS NOT NULL',
      [id]
    );
    const averageTimeTaken = avgTimeResult.rows[0].avg_time 
      ? Math.round(parseFloat(avgTimeResult.rows[0].avg_time))
      : 0;

    // Get frequently missed questions
    const missedQuestionsResult = await pool.query(
      `SELECT 
        qq.id as question_id,
        qq.question_text,
        COUNT(*) as miss_count,
        (COUNT(*) * 100.0 / $2) as miss_percentage
      FROM quiz_responses qr
      JOIN quiz_questions qq ON qr.question_id = qq.id
      JOIN quiz_attempts qa ON qr.attempt_id = qa.id
      WHERE qa.quiz_id = $1 
        AND qa.is_completed = true
        AND qr.is_correct = false
      GROUP BY qq.id, qq.question_text
      ORDER BY miss_count DESC
      LIMIT 10`,
      [id, completedAttempts || 1]
    );

    const frequentlyMissedQuestions = missedQuestionsResult.rows.map(q => ({
      question_id: q.question_id,
      question_text: q.question_text.substring(0, 200) + (q.question_text.length > 200 ? '...' : ''),
      miss_count: parseInt(q.miss_count) || 0,
      miss_percentage: parseFloat(q.miss_percentage).toFixed(2)
    }));

    // Get score distribution
    const scoreDistributionResult = await pool.query(
      `SELECT 
        CASE
          WHEN score >= 90 THEN '90-100'
          WHEN score >= 80 THEN '80-89'
          WHEN score >= 70 THEN '70-79'
          WHEN score >= 60 THEN '60-69'
          ELSE '0-59'
        END as range,
        COUNT(*) as count
      FROM quiz_attempts
      WHERE quiz_id = $1 AND is_completed = true AND score IS NOT NULL
      GROUP BY range
      ORDER BY range DESC`,
      [id]
    );

    const scoreDistribution = scoreDistributionResult.rows.map(r => ({
      range: r.range,
      count: parseInt(r.count) || 0
    }));

    // Get attempts over time (last 30 days)
    const attemptsOverTimeResult = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM quiz_attempts
      WHERE quiz_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [id]
    );

    const attemptsOverTime = attemptsOverTimeResult.rows.map(r => ({
      date: r.date,
      count: parseInt(r.count) || 0
    }));

    return NextResponse.json({
      analytics: {
        total_attempts: totalAttempts,
        completed_attempts: completedAttempts,
        average_score: parseFloat(averageScore),
        completion_rate: parseFloat(completionRate),
        pass_rate: parseFloat(passRate),
        average_time_taken: averageTimeTaken,
        frequently_missed_questions: frequentlyMissedQuestions,
        score_distribution: scoreDistribution,
        attempts_over_time: attemptsOverTime
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

