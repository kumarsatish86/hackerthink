import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const integrationId = parseInt(id, 10);
    if (Number.isNaN(integrationId)) {
      return NextResponse.json({ error: 'Invalid integration ID' }, { status: 400 });
    }

    const body = await request.json();
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (typeof body.status === 'boolean') {
      fields.push(`status = $${i++}`);
      values.push(body.status);
    }
    if (body.config !== undefined) {
      fields.push(`config = $${i++}`);
      values.push(typeof body.config === 'string' ? body.config : JSON.stringify(body.config));
    }
    if (typeof body.name === 'string') {
      fields.push(`name = $${i++}`);
      values.push(body.name);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(integrationId);
    const result = await pool.query(
      `UPDATE integrations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${i}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Integration updated successfully',
      integration: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const integrationId = parseInt(id, 10);
    if (Number.isNaN(integrationId)) {
      return NextResponse.json({ error: 'Invalid integration ID' }, { status: 400 });
    }

    const result = await pool.query(`SELECT * FROM integrations WHERE id = $1`, [integrationId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json({ integration: result.rows[0] });
  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json({ error: 'Failed to fetch integration' }, { status: 500 });
  }
}
