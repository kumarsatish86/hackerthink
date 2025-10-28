const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function createCourseTables() {
  const client = await pool.connect();
  
  try {
    console.log('Starting course tables creation...');
    await client.query('BEGIN');
    
    // Drop existing courses table first (if exists)
    await client.query(`
      DROP TABLE IF EXISTS courses CASCADE
    `);
    
    // Create expanded courses table
    console.log('Creating courses table...');
    await client.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        short_description TEXT,
        description TEXT NOT NULL,
        requirements TEXT,
        what_will_learn TEXT,
        who_is_for TEXT,
        featured_image TEXT,
        author_id INTEGER,
        level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
        duration INTEGER, -- Total duration in minutes
        price DECIMAL(10, 2),
        discount_price DECIMAL(10, 2),
        is_featured BOOLEAN DEFAULT FALSE,
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course sections table
    console.log('Creating course_sections table...');
    await client.query(`
      CREATE TABLE course_sections (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course chapters table
    console.log('Creating course_chapters table...');
    await client.query(`
      CREATE TABLE course_chapters (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'pdf', 'external_resource')),
        video_url TEXT,
        duration INTEGER, -- in minutes
        is_free_preview BOOLEAN DEFAULT FALSE,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create quizzes table
    console.log('Creating quizzes table...');
    await client.query(`
      CREATE TABLE quizzes (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        time_limit INTEGER, -- in minutes
        passing_score INTEGER, -- percentage
        attempts_allowed INTEGER DEFAULT 1,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create quiz questions table
    console.log('Creating quiz_questions table...');
    await client.query(`
      CREATE TABLE quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_in_blank')),
        options JSONB,
        correct_answer JSONB,
        points INTEGER DEFAULT 1,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create assignments table
    console.log('Creating assignments table...');
    await client.query(`
      CREATE TABLE assignments (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        due_days INTEGER, -- days to complete after starting
        points INTEGER DEFAULT 10,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create course reviews table
    console.log('Creating course_reviews table...');
    await client.query(`
      CREATE TABLE course_reviews (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        user_id INTEGER,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query('COMMIT');
    console.log('Course tables creation completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating course tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute the creation
createCourseTables()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 
