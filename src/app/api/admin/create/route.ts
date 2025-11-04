import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function POST(request: Request) {
  try {
    // First check if there are no admins
    const adminCheck = await pool.query(
      'SELECT COUNT(*) as admin_count FROM users WHERE role = $1',
      ['admin']
    );
    
    const adminCount = parseInt(adminCheck.rows[0].admin_count);
    
    // If there are already admin accounts, block creation of more
    if (adminCount > 0) {
      return NextResponse.json(
        { message: 'Admin account already exists' },
        { status: 403 }
      );
    }
    
    // Create the admin account
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database with admin role
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'admin']
    );

    const newUser = result.rows[0];

    // Don't return the password
    delete newUser.password;

    return NextResponse.json(
      { message: 'Admin account created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    return NextResponse.json(
      { message: 'Error creating admin account', error: error.message },
      { status: 500 }
    );
  }
} 
