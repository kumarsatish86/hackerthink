const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Sample lab exercises to add
const labExercises = [
  {
    title: 'Basic Linux Commands',
    slug: 'basic-linux-commands',
    description: 'Learn and practice essential Linux commands like ls, cd, mkdir, rm, etc.',
    content: 'This lab will walk you through the most common Linux commands used for file navigation and management.',
    instructions: 'Follow the instructions to practice using basic Linux commands in the terminal.',
    solution: 'Solutions for basic Linux commands exercise',
    difficulty: 'beginner',
    duration: 45,
    prerequisites: 'None',
    published: true
  },
  {
    title: 'File Permissions in Linux',
    slug: 'file-permissions-linux',
    description: 'Understanding and configuring file permissions using chmod and chown commands.',
    content: 'Learn how Linux file permissions work and how to modify them effectively.',
    instructions: 'Follow these steps to understand and configure file permissions in Linux.',
    solution: 'Solutions for file permissions exercise',
    difficulty: 'intermediate',
    duration: 60,
    prerequisites: 'Basic Linux command knowledge',
    published: true
  },
  {
    title: 'Shell Scripting Basics',
    slug: 'shell-scripting-basics',
    description: 'Introduction to shell scripting with bash, creating and executing simple scripts.',
    content: 'Learn the fundamentals of bash shell scripting to automate common tasks.',
    instructions: 'Follow these instructions to create your first bash scripts.',
    solution: 'Solutions for shell scripting basics exercise',
    difficulty: 'beginner',
    duration: 90,
    prerequisites: 'Basic Linux command knowledge',
    published: true
  },
  {
    title: 'Networking with Linux',
    slug: 'networking-with-linux',
    description: 'Configuring and troubleshooting network interfaces in Linux.',
    content: 'Learn how to configure network settings and troubleshoot connectivity issues in Linux.',
    instructions: 'Follow these steps to configure and test network interfaces.',
    solution: 'Solutions for networking with Linux exercise',
    difficulty: 'advanced',
    duration: 120,
    prerequisites: 'Basic Linux knowledge, understanding of networking concepts',
    published: true
  },
  {
    title: 'User Management in Linux',
    slug: 'user-management-linux',
    description: 'Creating, modifying, and deleting users and groups in Linux systems.',
    content: 'Learn how to manage users and groups in Linux, including setting up permissions and home directories.',
    instructions: 'Follow these steps to create and manage users and groups in Linux.',
    solution: 'Solutions for user management in Linux exercise',
    difficulty: 'intermediate',
    duration: 60,
    prerequisites: 'Basic Linux command knowledge, understanding of file permissions',
    published: true
  },
  {
    title: 'iptables Firewall Configuration',
    slug: 'iptables-firewall-configuration',
    description: 'Setting up and managing firewall rules with iptables in Linux.',
    content: 'Learn how to configure and manage the iptables firewall to secure your Linux system.',
    instructions: 'Follow these steps to set up and test iptables firewall rules.',
    solution: 'Solutions for iptables firewall configuration exercise',
    difficulty: 'advanced',
    duration: 150,
    prerequisites: 'Intermediate Linux knowledge, understanding of networking concepts',
    published: true
  }
];

async function addTestLabExercises() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if lab_exercises table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_exercises'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Lab exercises table does not exist. Creating it first...');
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
    }

    // Add each exercise if it doesn't already exist
    for (const exercise of labExercises) {
      // Check if this exercise already exists
      const checkResult = await client.query(
        `SELECT EXISTS (SELECT 1 FROM lab_exercises WHERE slug = $1)`,
        [exercise.slug]
      );
      
      if (checkResult.rows[0].exists) {
        console.log(`Exercise '${exercise.title}' already exists, skipping creation`);
      } else {
        // Create the exercise
        const insertResult = await client.query(`
          INSERT INTO lab_exercises (
            title,
            slug,
            description,
            content,
            instructions,
            solution,
            difficulty,
            duration,
            prerequisites,
            published,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          ) RETURNING id
        `, [
          exercise.title,
          exercise.slug,
          exercise.description,
          exercise.content,
          exercise.instructions,
          exercise.solution,
          exercise.difficulty,
          exercise.duration,
          exercise.prerequisites,
          exercise.published
        ]);
        
        console.log(`Created lab exercise '${exercise.title}' with ID: ${insertResult.rows[0].id}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Process completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding lab exercises:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the function
addTestLabExercises()
  .then(() => {
    console.log('Lab exercises added successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Process failed:', error);
    process.exit(1);
  }); 
