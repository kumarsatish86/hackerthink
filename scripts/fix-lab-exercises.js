const { Pool } = require('pg');

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function fixLabExercises() {
  const client = await pool.connect();
  try {
    console.log('Checking lab_exercises table...');
    
    // Check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_exercises'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Error: lab_exercises table does not exist!');
      return;
    }
    
    // List all exercises
    console.log('Current exercises in database:');
    const before = await client.query(`SELECT id, title, slug, difficulty, duration, published FROM lab_exercises`);
    console.log('-------------------------------');
    before.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Published: ${row.published}`);
    });
    console.log('-------------------------------');

    // Mark all exercises as published
    const result = await client.query(`UPDATE lab_exercises SET published = true`);
    console.log(`Updated ${result.rowCount} rows to set published = true`);
    
    // Check exercise count again
    const countResult = await client.query(`SELECT COUNT(*) FROM lab_exercises WHERE published = true`);
    console.log(`Now have ${countResult.rows[0].count} published exercises`);
    
    // Add missing category column if needed
    try {
      const categoryExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'lab_exercises' AND column_name = 'category'
        );
      `);
      
      if (!categoryExists.rows[0].exists) {
        console.log('Adding category column to lab_exercises table...');
        await client.query(`ALTER TABLE lab_exercises ADD COLUMN category VARCHAR(50)`);
        console.log('Category column added');
      }
    } catch (err) {
      console.warn('Error checking/adding category column:', err.message);
    }
    
    // Map categories to exercises based on slug
    const categoryMapping = {
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
    
    // Update categories for each exercise
    for (const [slug, category] of Object.entries(categoryMapping)) {
      await client.query(`
        UPDATE lab_exercises 
        SET category = $1 
        WHERE slug = $2
      `, [category, slug]);
    }
    
    console.log('Updated categories based on slug mapping');
    
    // List updated exercises
    console.log('\nUpdated exercises in database:');
    const after = await client.query(`
      SELECT id, title, slug, difficulty, duration, published, category 
      FROM lab_exercises
    `);
    console.log('-------------------------------');
    after.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Category: ${row.category}, Published: ${row.published}`);
    });
    console.log('-------------------------------');
    
  } catch (error) {
    console.error('Error fixing lab exercises:', error);
  } finally {
    client.release();
    // Close the pool
    pool.end();
  }
}

// Run the fix
fixLabExercises()
  .then(() => console.log('Fix completed'))
  .catch(err => console.error('Error during fix:', err)); 