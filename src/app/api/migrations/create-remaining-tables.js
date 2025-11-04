/**
 * Script to create the remaining missing tables in the HackerThink database
 */
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createRemainingTables() {
  console.log('Creating remaining missing tables...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if UUID extension is enabled
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Check and create course_quizzes table
    const courseQuizzesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_quizzes'
      );
    `);
    
    if (!courseQuizzesTableCheck.rows[0].exists) {
      console.log('Creating course_quizzes table...');
      await client.query(`
        CREATE TABLE course_quizzes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          pass_percentage INTEGER DEFAULT 70,
          time_limit INTEGER,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('course_quizzes table created successfully');
    } else {
      console.log('course_quizzes table already exists');
    }

    // Check and create quiz_answers table
    const quizAnswersTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_answers'
      );
    `);
    
    if (!quizAnswersTableCheck.rows[0].exists) {
      console.log('Creating quiz_answers table...');
      await client.query(`
        CREATE TABLE quiz_answers (
          id SERIAL PRIMARY KEY,
          question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
          answer_text TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT FALSE,
          position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('quiz_answers table created successfully');
    } else {
      console.log('quiz_answers table already exists');
    }
    
    await client.query('COMMIT');
    console.log('All remaining tables created successfully');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to create remaining tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// If this file is being run directly
if (require.main === module) {
  createRemainingTables()
    .then(() => {
      console.log('Remaining tables creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Remaining tables creation process failed:', error);
      process.exit(1);
    });
} else {
  // Export for importing in other files
  module.exports = { createRemainingTables }; 
} 
