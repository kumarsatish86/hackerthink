import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// Define the valid roles for the system
const validRoles = ['admin', 'editor', 'author', 'instructor', 'user'];

export async function GET(request: Request) {
  try {
    // Extract role from query params or default to 'author'
    const { searchParams } = new URL(request.url);
    let role = searchParams.get('role') || 'author';
    
    // Validate the requested role
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Get current session
    const session = await getServerSession();
    
    // If there's a logged-in user, update their role
    if (session?.user?.email) {
      // Update the current user's role
      await pool.query(
        'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
        [role, session.user.email]
      );
      
      return NextResponse.json({ 
        message: `Current user's role updated to ${role}`,
        user: {
          email: session.user.email,
          role: role
        }
      });
    } else {
      // Create a new user with the specified role if none exists
      const testEmail = `test.${role}@example.com`;
      
      // Check if the user already exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [testEmail]
      );
      
      if (existingUser.rows.length > 0) {
        // Update existing user role
        await pool.query(
          'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
          [role, testEmail]
        );
        
        return NextResponse.json({ 
          message: `Existing user updated with ${role} role`,
          user: {
            email: testEmail,
            role: role
          },
          login: {
            email: testEmail,
            password: 'password123'
          }
        });
      } else {
        // Create a new user with the specified role
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const result = await pool.query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
          [`${role.charAt(0).toUpperCase() + role.slice(1)} User`, testEmail, hashedPassword, role]
        );
        
        return NextResponse.json({ 
          message: `New user created with ${role} role`,
          user: result.rows[0],
          login: {
            email: testEmail,
            password: 'password123'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
