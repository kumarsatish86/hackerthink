/**
 * Shared database schema to ensure consistency across the application
 */
const { Pool } = require('pg');

// Configure database connection pool
const getPool = () => new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// Unified database initialization function with consistent ID types
async function initializeDatabase() {
  // Skip DB initialization if SKIP_DB_INIT env var is set (during Next.js build)
  if (process.env.SKIP_DB_INIT === 'true') {
    console.log('Skipping database initialization due to SKIP_DB_INIT flag');
    return { success: true, skipped: true };
  }

  const pool = getPool();
  const client = await pool.connect();
  
  try {
    console.log('Starting database initialization...');
    await client.query('BEGIN');
    
    // Create users table if it doesn't exist
    console.log('Creating users table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create articles table if it doesn't exist
    console.log('Creating articles table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        author_id INTEGER,
        featured_image TEXT,
        meta_title TEXT,
        meta_description TEXT,
        schema_json TEXT,
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create glossary_terms table if it doesn't exist
    console.log('Creating glossary_terms table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS glossary_terms (
        id SERIAL PRIMARY KEY,
        term VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        definition TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create courses table if it doesn't exist
    console.log('Creating courses table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        short_description TEXT,
        description TEXT,
        requirements TEXT,
        what_will_learn TEXT,
        who_is_for TEXT,
        content TEXT,
        featured_image TEXT,
        author_id INTEGER,
        level VARCHAR(50) DEFAULT 'Beginner',
        duration INTEGER DEFAULT 0,
        price DECIMAL(10,2) DEFAULT 0,
        discount_price DECIMAL(10,2),
        is_featured BOOLEAN DEFAULT FALSE,
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course_sections table if it doesn't exist
    console.log('Creating course_sections table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_sections (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course_chapters table if it doesn't exist
    console.log('Creating course_chapters table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_chapters (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        video_url TEXT,
        duration INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        is_free BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course_quizzes table if it doesn't exist
    console.log('Creating course_quizzes table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_quizzes (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        pass_percentage INTEGER DEFAULT 70,
        time_limit INTEGER,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create quiz_questions table if it doesn't exist
    console.log('Creating quiz_questions table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'multiple_choice',
        points INTEGER DEFAULT 1,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create quiz_answers table if it doesn't exist
    console.log('Creating quiz_answers table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        answer_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course_assignments table if it doesn't exist
    console.log('Creating course_assignments table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_assignments (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        max_score INTEGER DEFAULT 100,
        due_days INTEGER,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query('COMMIT');
    console.log('Database initialization completed successfully!');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

module.exports = { initializeDatabase }; 
