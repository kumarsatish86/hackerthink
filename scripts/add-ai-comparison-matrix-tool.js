const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIComparisonMatrixTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Comparison Matrix Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-comparison-matrix']
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
        WHERE slug = 'ai-comparison-matrix'
      `, [
        'AI Comparison Matrix',
        'Compare AI tools side-by-side. Compare features, pricing, pros, cons, and limits of ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, Ideogram, and more. Find the perfect AI tool for your needs with our detailed comparison matrix.',
        '📊',
        '/tools/ai-comparison-matrix',
        true,
        'AI Comparison Matrix - Compare ChatGPT vs Claude vs Gemini vs Midjourney vs DALL-E',
        'Compare AI tools side-by-side. Compare features, pricing, pros, cons, and limits. Find the best AI tool for your needs. Compare ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, and more.',
        'ai comparison, chatgpt vs claude, claude vs gemini, midjourney vs dalle, ai tool comparison, compare ai tools, chatgpt vs gemini, best ai tool, ai tool comparison matrix, ai tool reviews, ai tool features, ai tool pricing',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-comparison-matrix',
        98
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
        'AI Comparison Matrix',
        'ai-comparison-matrix',
        'Compare AI tools side-by-side. Compare features, pricing, pros, cons, and limits of ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, Ideogram, and more. Find the perfect AI tool for your needs with our detailed comparison matrix.',
        '📊',
        '/tools/ai-comparison-matrix',
        true,
        'AI Comparison Matrix - Compare ChatGPT vs Claude vs Gemini vs Midjourney vs DALL-E',
        'Compare AI tools side-by-side. Compare features, pricing, pros, cons, and limits. Find the best AI tool for your needs. Compare ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, and more.',
        'ai comparison, chatgpt vs claude, claude vs gemini, midjourney vs dalle, ai tool comparison, compare ai tools, chatgpt vs gemini, best ai tool, ai tool comparison matrix, ai tool reviews, ai tool features, ai tool pricing',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-comparison-matrix',
        98
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Comparison Matrix tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIComparisonMatrixTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

