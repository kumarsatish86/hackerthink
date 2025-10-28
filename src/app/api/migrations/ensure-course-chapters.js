const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function ensureCourseChaptersExists() {
  const client = await pool.connect();
  
  try {
    console.log('Checking if course_chapters table exists...');
    
    // Check if course_chapters table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_chapters'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('course_chapters table already exists.');
      return;
    }
    
    console.log('course_chapters table does not exist. Creating it...');
    await client.query('BEGIN');
    
    // Check if course_sections table exists, which is required for the foreign key
    const sectionTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_sections'
      );
    `);
    
    const sectionTableExists = sectionTableCheck.rows[0].exists;
    
    if (!sectionTableExists) {
      console.log('course_sections table does not exist. Creating it first...');
      
      // Check if courses table exists, required for course_sections
      const coursesTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'courses'
        );
      `);
      
      const coursesTableExists = coursesTableCheck.rows[0].exists;
      
      if (!coursesTableExists) {
        console.log('courses table does not exist. Creating it first...');
        await client.query(`
          CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            short_description TEXT,
            description TEXT NOT NULL,
            requirements TEXT,
            what_will_learn TEXT,
            who_is_for TEXT,
            featured_image TEXT,
            author_id UUID,
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
        console.log('courses table created successfully.');
      }
      
      // Get column info from courses table to ensure we use the right type
      const coursesColumnsInfo = await client.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'id'
      `);
      
      const courseIdType = coursesColumnsInfo.rows[0]?.data_type || 'uuid';
      console.log(`Detected course ID type: ${courseIdType}`);
      
      await client.query(`
        CREATE TABLE course_sections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('course_sections table created successfully.');
    }
    
    // Get column info from course_sections table to ensure we use the right type
    const sectionsColumnsInfo = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'course_sections' AND column_name = 'id'
    `);
    
    const sectionIdType = sectionsColumnsInfo.rows[0]?.data_type || 'uuid';
    console.log(`Detected section ID type: ${sectionIdType}`);
    
    // Create course chapters table using the correct type
    await client.query(`
      CREATE TABLE course_chapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
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
    
    await client.query('COMMIT');
    console.log('course_chapters table created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ensuring course_chapters table exists:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute
ensureCourseChaptersExists()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 
