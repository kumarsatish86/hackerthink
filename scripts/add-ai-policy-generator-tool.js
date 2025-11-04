const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIPolicyGeneratorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Policy Generator Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-policy-generator']
    );

    if (existingTool.rows.length > 0) {
      console.log('Tool already exists, updating...');
      
      await client.query(`
        UPDATE tools SET
          title = $1,
          description = $2,
          icon = $3,
          file_path = $4,
          published = $5,
          seo_title = $6,
          seo_description = $7,
          seo_keywords = $8,
          category = $9,
          platform = $10,
          license = $11,
          official_url = $12,
          popularity = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = 'ai-policy-generator'
      `, [
        'AI Policy / Terms Generator',
        'Generate boilerplate AI usage policies and disclosure statements for organizations, freelancers, agencies, students, and content creators. Create responsible AI usage policies or AI disclosure lines. Templates for different use cases. Important: Not legal advice - consult with qualified attorneys before use.',
        '📜',
        '/tools/ai-policy-generator',
        true,
        'AI Policy Generator - Responsible AI Usage Policy & Disclosure Statement Templates',
        'Generate AI usage policies and disclosure statements. Create responsible AI usage policies for companies, freelancers, agencies, students, and content creators. Templates for disclosure lines and full policy documents. Perfect for HR, compliance, and transparency requirements. Not legal advice - consult attorneys.',
        'ai policy generator, ai usage policy, ai disclosure statement, responsible ai policy, ai terms generator, ai policy template, ai disclosure line, company ai policy, freelance ai policy, student ai policy, hr ai policy, ai compliance, ai transparency, ai ethics policy',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-policy-generator',
        97
      ]);
      
      console.log('✅ Tool updated successfully!');
    } else {
      console.log('Adding new tool...');
      
      const result = await client.query(`
        INSERT INTO tools (
          title, slug, description, icon, file_path, published,
          seo_title, seo_description, seo_keywords,
          category, platform, license, official_url, popularity,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, title, slug
      `, [
        'AI Policy / Terms Generator',
        'ai-policy-generator',
        'Generate boilerplate AI usage policies and disclosure statements for organizations, freelancers, agencies, students, and content creators. Create responsible AI usage policies or AI disclosure lines. Templates for different use cases. Important: Not legal advice - consult with qualified attorneys before use.',
        '📜',
        '/tools/ai-policy-generator',
        true,
        'AI Policy Generator - Responsible AI Usage Policy & Disclosure Statement Templates',
        'Generate AI usage policies and disclosure statements. Create responsible AI usage policies for companies, freelancers, agencies, students, and content creators. Templates for disclosure lines and full policy documents. Perfect for HR, compliance, and transparency requirements. Not legal advice - consult attorneys.',
        'ai policy generator, ai usage policy, ai disclosure statement, responsible ai policy, ai terms generator, ai policy template, ai disclosure line, company ai policy, freelance ai policy, student ai policy, hr ai policy, ai compliance, ai transparency, ai ethics policy',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-policy-generator',
        97
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Policy Generator tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIPolicyGeneratorTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

