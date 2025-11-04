import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// GET export datasets as JSON
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM datasets ORDER BY created_at DESC');

    return NextResponse.json({
      datasets: result.rows,
      exportDate: new Date().toISOString(),
      totalRecords: result.rows.length
    }, {
      headers: {
        'Content-Disposition': `attachment; filename=datasets-export-${Date.now()}.json`
      }
    });
  } catch (error) {
    console.error('Error exporting datasets:', error);
    return NextResponse.json(
      { error: 'Failed to export datasets' },
      { status: 500 }
    );
  }
}

