import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: Request,
  { params }: { params: { location: string } }
) {
  try {
    const { location } = params;
    
    const result = await pool.query(`
      SELECT id, name, location, ad_code, display_rules
      FROM tutorial_ad_zones 
      WHERE location = $1 AND is_active = true
    `, [location]);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tutorial ads:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch tutorial ads' 
      },
      { status: 500 }
    );
  }
}
