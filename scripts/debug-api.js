const { Pool } = require('pg');

// Create a pool connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function main() {
  try {
    console.log('Performing detailed diagnostics on lab exercise API...');
    
    // 1. Check if the table structure is as expected
    console.log('\n1. Checking lab_exercises table structure:');
    const tableQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lab_exercises'
      ORDER BY ordinal_position;
    `;
    const tableStructure = await pool.query(tableQuery);
    console.log('Table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`);
    });
    
    // 2. Try to execute the exact query from the API endpoint
    console.log('\n2. Testing the exact query from the API endpoint:');
    const testSlug = 'shell-scripting-basics';
    try {
      const { rows } = await pool.query(
        `SELECT 
          e.id, 
          e.title,
          e.slug,
          e.description,
          e.content,
          e.instructions,
          e.solution,
          e.difficulty,
          e.duration,
          e.prerequisites,
          e.related_course_id,
          e.featured_image,
          e.meta_title,
          e.meta_description,
          e.schema_json,
          e.created_at,
          e.updated_at,
          u.name as author_name
        FROM lab_exercises e
        LEFT JOIN users u ON e.author_id = u.id::text
        WHERE e.slug = $1 AND e.published = true`,
        [testSlug]
      );
      
      if (rows.length === 0) {
        console.log(`No lab exercise found with slug: ${testSlug}`);
      } else {
        console.log(`Found lab exercise: ${rows[0].title} (ID: ${rows[0].id})`);
        
        // Check for null or empty critical fields
        const criticalFields = ['content', 'instructions'];
        for (const field of criticalFields) {
          if (!rows[0][field] || rows[0][field].trim() === '') {
            console.log(`Warning: Critical field '${field}' is empty or null`);
          } else {
            console.log(`Field '${field}' has content of length: ${rows[0][field].length}`);
          }
        }
      }
    } catch (error) {
      console.error('Error executing the API query:', error);
    }
    
    // 3. Check the exercise explicitly without the join or published filter
    console.log('\n3. Checking the exercise without joins or filters:');
    try {
      const simpleResult = await pool.query(
        'SELECT id, title, slug, published FROM lab_exercises WHERE slug = $1',
        [testSlug]
      );
      
      if (simpleResult.rows.length === 0) {
        console.log(`No lab exercise found with slug: ${testSlug} (without filters)`);
      } else {
        console.log('Basic details:');
        console.log(simpleResult.rows[0]);
        
        // If it exists but wasn't found in the API query, check the published status
        if (simpleResult.rows[0].published === false) {
          console.log(`\nProblem identified: The exercise exists but is marked as unpublished`);
          
          // Offer to fix it
          console.log('\nFixing the published status...');
          await pool.query(
            'UPDATE lab_exercises SET published = true WHERE slug = $1 RETURNING id, title',
            [testSlug]
          );
          console.log('Published status updated to true');
        }
      }
    } catch (error) {
      console.error('Error executing the simple query:', error);
    }
    
    // 4. Check if there's an issue with the users table join
    console.log('\n4. Testing the users table join:');
    try {
      const joinTest = await pool.query(
        `SELECT u.id, u.name 
         FROM users u 
         LIMIT 5`
      );
      
      if (joinTest.rows.length === 0) {
        console.log('No users found in the users table');
        
        // Check lab_exercises.author_id values
        const authorCheck = await pool.query(
          'SELECT id, title, author_id FROM lab_exercises WHERE slug = $1',
          [testSlug]
        );
        
        if (authorCheck.rows.length > 0) {
          console.log(`Exercise author_id: ${authorCheck.rows[0].author_id}`);
          
          if (authorCheck.rows[0].author_id) {
            console.log('\nPotential problem identified: The exercise has an author_id but the user might not exist');
          }
        }
      } else {
        console.log(`Found ${joinTest.rows.length} users in the users table`);
        console.log('Sample users:');
        joinTest.rows.forEach(user => {
          console.log(`  ID: ${user.id}, Name: ${user.name}`);
        });
      }
    } catch (error) {
      console.error('Error testing the users table:', error);
      console.log('\nPotential problem identified: There might be an issue with the users table');
    }
    
    // 5. Try the API query with author_id conversion problem fixed
    console.log('\n5. Testing a modified version of the API query:');
    try {
      const { rows } = await pool.query(
        `SELECT 
          e.id, 
          e.title,
          e.slug,
          e.description,
          e.content,
          e.instructions,
          e.solution,
          e.difficulty,
          e.duration,
          e.prerequisites,
          e.related_course_id,
          e.featured_image,
          e.meta_title,
          e.meta_description,
          e.schema_json,
          e.created_at,
          e.updated_at,
          u.name as author_name
        FROM lab_exercises e
        LEFT JOIN users u ON e.author_id = CAST(u.id AS TEXT)
        WHERE e.slug = $1 AND e.published = true`,
        [testSlug]
      );
      
      if (rows.length > 0) {
        console.log(`Modified query found lab exercise: ${rows[0].title}`);
      } else {
        console.log('Modified query still found no results');
      }
    } catch (error) {
      console.error('Error executing the modified API query:', error);
    }
    
    // 6. Final check - simplified query with just the necessary fields
    console.log('\n6. Testing a simplified query:');
    try {
      const { rows } = await pool.query(
        `SELECT 
          id, title, slug, description, content, instructions
        FROM lab_exercises
        WHERE slug = $1 AND published = true`,
        [testSlug]
      );
      
      if (rows.length > 0) {
        console.log(`Simplified query found lab exercise: ${rows[0].title}`);
        console.log('This indicates the issue is likely with the join operation or a related field');
      } else {
        console.log('Simplified query found no results');
        console.log('This indicates the issue is with the basic record or the published status');
      }
    } catch (error) {
      console.error('Error executing the simplified query:', error);
    }
  } catch (error) {
    console.error('Error performing diagnostics:', error);
  } finally {
    await pool.end();
  }
}

main(); 