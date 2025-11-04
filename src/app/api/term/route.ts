import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
  // Connection timeout
  connectionTimeoutMillis: 5000,
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category') || null;
    const search = url.searchParams.get('search') || null;
    const letter = url.searchParams.get('letter') || null;
    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(term ILIKE $${paramIndex} OR definition ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (letter) {
      conditions.push(`term ILIKE $${paramIndex}`);
      queryParams.push(`${letter}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get a client from the pool for transaction
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // Calculate total terms for pagination from the glossary_terms table
      const countQuery = `SELECT COUNT(*) FROM glossary_terms ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0]?.count || '0');

      // Build main query using glossary_terms table
      const query = `
        SELECT 
          id, 
          term,
          slug,
          definition,
          category
        FROM glossary_terms
        ${whereClause}
        ORDER BY term ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      // Add pagination parameters
      queryParams.push(limit, offset);

      // Execute query
      const { rows } = await client.query(query, queryParams);

      // Get all available categories for filtering
      const categoriesResult = await client.query(
        'SELECT DISTINCT category FROM glossary_terms ORDER BY category'
      );
      const categories = categoriesResult.rows.map(row => row.category);

      // Get all starting letters for filtering
      const lettersResult = await client.query(
        "SELECT DISTINCT LEFT(UPPER(term), 1) as letter FROM glossary_terms ORDER BY letter"
      );
      const letters = lettersResult.rows.map(row => row.letter);

      // Commit transaction
      await client.query('COMMIT');

      return NextResponse.json({ 
        terms: rows,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        },
        filters: {
          categories,
          letters
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { message: 'Failed to fetch glossary terms. Please try again later.', error: String(error) },
      { status: 500 }
    );
  }
} 
