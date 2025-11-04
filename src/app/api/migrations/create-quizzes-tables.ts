import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function createQuizzesTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Creating quizzes tables...');

    // 1. Create quizzes table
    const quizzesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes'
      )
    `);

    if (!quizzesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quizzes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          thumbnail_url TEXT,
          difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
          estimated_time INTEGER,
          passing_score INTEGER DEFAULT 70,
          randomize_questions BOOLEAN DEFAULT FALSE,
          randomize_answers BOOLEAN DEFAULT FALSE,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT
        )
      `);
      await client.query(`CREATE INDEX idx_quizzes_slug ON quizzes(slug)`);
      await client.query(`CREATE INDEX idx_quizzes_status ON quizzes(status)`);
      await client.query(`CREATE INDEX idx_quizzes_created_by ON quizzes(created_by)`);
      await client.query(`CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty)`);
      console.log('Created quizzes table');
    }

    // 2. Create quiz_questions table
    const questionsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_questions'
      )
    `);

    if (!questionsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quiz_questions (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'multiple_select', 'true_false')),
          order_in_quiz INTEGER NOT NULL,
          explanation_text TEXT,
          related_article_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id)`);
      await client.query(`CREATE INDEX idx_quiz_questions_order ON quiz_questions(quiz_id, order_in_quiz)`);
      console.log('Created quiz_questions table');
    }

    // 3. Create quiz_question_options table
    const optionsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_question_options'
      )
    `);

    if (!optionsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quiz_question_options (
          id SERIAL PRIMARY KEY,
          question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT FALSE,
          order_in_question INTEGER NOT NULL
        )
      `);
      await client.query(`CREATE INDEX idx_quiz_question_options_question_id ON quiz_question_options(question_id)`);
      await client.query(`CREATE INDEX idx_quiz_question_options_order ON quiz_question_options(question_id, order_in_question)`);
      console.log('Created quiz_question_options table');
    }

    // 4. Create quiz_categories table
    const categoriesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_categories'
      )
    `);

    if (!categoriesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quiz_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_quiz_categories_slug ON quiz_categories(slug)`);
      console.log('Created quiz_categories table');
    }

    // 5. Create quiz_category_assignments table
    const assignmentsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_category_assignments'
      )
    `);

    if (!assignmentsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quiz_category_assignments (
          quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          category_id INTEGER NOT NULL REFERENCES quiz_categories(id) ON DELETE CASCADE,
          PRIMARY KEY (quiz_id, category_id)
        )
      `);
      await client.query(`CREATE INDEX idx_quiz_category_assignments_quiz_id ON quiz_category_assignments(quiz_id)`);
      await client.query(`CREATE INDEX idx_quiz_category_assignments_category_id ON quiz_category_assignments(category_id)`);
      console.log('Created quiz_category_assignments table');
    }

    // 6. Create quiz_attempts table
    const attemptsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_attempts'
      )
    `);

    if (!attemptsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quiz_attempts (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          session_id VARCHAR(255),
          start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP WITH TIME ZONE,
          score DECIMAL(5,2),
          is_completed BOOLEAN DEFAULT FALSE,
          time_taken INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)`);
      await client.query(`CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id)`);
      await client.query(`CREATE INDEX idx_quiz_attempts_session_id ON quiz_attempts(session_id)`);
      await client.query(`CREATE INDEX idx_quiz_attempts_created_at ON quiz_attempts(created_at)`);
      console.log('Created quiz_attempts table');
    }

    // 7. Create quiz_responses table
    const responsesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_responses'
      )
    `);

    if (!responsesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE quiz_responses (
          id SERIAL PRIMARY KEY,
          attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
          question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
          selected_option_ids JSONB NOT NULL DEFAULT '[]',
          is_correct BOOLEAN,
          time_spent INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_quiz_responses_attempt_id ON quiz_responses(attempt_id)`);
      await client.query(`CREATE INDEX idx_quiz_responses_question_id ON quiz_responses(question_id)`);
      console.log('Created quiz_responses table');
    }

    // Create or update the updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at columns
    await client.query(`
      DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
      CREATE TRIGGER update_quizzes_updated_at
          BEFORE UPDATE ON quizzes
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_quiz_questions_updated_at ON quiz_questions;
      CREATE TRIGGER update_quiz_questions_updated_at
          BEFORE UPDATE ON quiz_questions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('Quizzes tables created successfully');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating quizzes tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

