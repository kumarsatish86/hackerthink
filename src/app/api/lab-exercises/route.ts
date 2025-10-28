import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { Pool } from 'pg';

// Create a connection pool that will be reused across requests
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
  max: 20, // Set max pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
});

// Test the database connection only when the API route is actually called
// This prevents database connections during build time
let connectionTested = false;

async function testConnection() {
  if (!connectionTested) {
    try {
      await pool.query('SELECT NOW()');
      console.log('Database connection established successfully');
      connectionTested = true;
    } catch (err) {
      console.error('Error connecting to database:', err);
    }
  }
}

// Skills mapping for different lab exercises
const skillsMapping: Record<string, string[]> = {
  'basic-linux-commands': ['File Navigation', 'Directory Management', 'File Manipulation'],
  'file-permissions-linux': ['Permission Management', 'Security Configuration', 'Access Control'],
  'shell-scripting-basics': ['Bash Scripting', 'Automation', 'Script Debugging'],
  'networking-with-linux': ['Network Configuration', 'Interface Management', 'Troubleshooting'],
  'user-management-linux': ['User Administration', 'Group Management', 'Permission Planning'],
  'iptables-firewall-configuration': ['Firewall Rules', 'Network Security', 'Traffic Control'],
  'ssh-configuration-hardening': ['SSH Security', 'Key Management', 'Secure Access'],
  'linux-disk-management': ['Disk Partitioning', 'LVM', 'Filesystem Management'],
  'web-server-configuration': ['Web Server Setup', 'Performance Tuning', 'Security Configuration'],
  'test-lab-exercise': ['Testing', 'Development', 'Configuration']
};

// Completion rates (in real-world, this would come from a database with user progress info)
const completionRates: Record<string, number> = {
  'basic-linux-commands': 94,
  'file-permissions-linux': 87,
  'shell-scripting-basics': 82,
  'networking-with-linux': 76,
  'user-management-linux': 89,
  'iptables-firewall-configuration': 71,
  'ssh-configuration-hardening': 84,
  'linux-disk-management': 80,
  'web-server-configuration': 78,
  'test-lab-exercise': 85
};

// Category mapping for exercises (in real-world, this would be a column in the database)
const categoryMapping: Record<string, string> = {
  'basic-linux-commands': 'linux-basics',
  'file-permissions-linux': 'linux-administration',
  'shell-scripting-basics': 'scripting',
  'networking-with-linux': 'networking',
  'user-management-linux': 'linux-administration',
  'iptables-firewall-configuration': 'security',
  'ssh-configuration-hardening': 'security',
  'linux-disk-management': 'linux-administration',
  'web-server-configuration': 'system-services',
  'test-lab-exercise': 'linux-basics'
};

// Check if the lab_exercises table exists, and if not, create it
async function ensureTableExists() {
  const client = await pool.connect();
  try {
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_exercises'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('lab_exercises table does not exist, creating it...');
      await client.query(`
        CREATE TABLE lab_exercises (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          content TEXT NOT NULL,
          instructions TEXT NOT NULL,
          solution TEXT,
          difficulty VARCHAR(50) DEFAULT 'Beginner',
          duration INTEGER DEFAULT 30,
          prerequisites TEXT,
          related_course_id INTEGER,
          featured_image TEXT,
          meta_title TEXT,
          meta_description TEXT,
          schema_json TEXT,
          published BOOLEAN DEFAULT FALSE,
          author_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking/creating lab_exercises table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// GET endpoint for retrieving lab exercises
export async function GET(req: NextRequest) {
  // Test database connection only when API is called
  await testConnection();
  
  const searchParams = req.nextUrl.searchParams;
  const difficulty = searchParams.get('difficulty');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  
  const client = await pool.connect();
  
  try {
    // Simple query without any JOINs to avoid type issues
    let query = `
      SELECT id, title, slug, description, content, instructions, solution, 
             difficulty, duration, prerequisites, related_course_id, featured_image,
             meta_title, meta_description, schema_json, published, author_id,
             created_at, updated_at, 'Admin User' as author_name
      FROM lab_exercises
      WHERE published = true
    `;
    
    const queryParams: any[] = [];
    
    // Add filter for difficulty if provided
    if (difficulty) {
      query += ` AND difficulty = $1`;
      queryParams.push(difficulty);
    }
    
    // Add ordering and limit
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);
    
    console.log('Executing query:', query);
    console.log('Query params:', queryParams);
    
    const result = await client.query(query, queryParams);
    console.log('Query result rows:', result.rows.length);
    
    return NextResponse.json({ lab_exercises: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving lab exercises:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve lab exercises' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 
