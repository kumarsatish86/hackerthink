const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIVoiceCloningLegalityCheckerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Voice Cloning Legality Checker Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-voice-cloning-legality-checker']
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
        WHERE slug = 'ai-voice-cloning-legality-checker'
      `, [
        'AI Voice Cloning Legality Checker',
        'Assess the legal risk of voice cloning based on voice source (self, celebrity, client, public figure) and use case (personal, commercial). Get general legal guidance, recommendations, and risk assessments before cloning voices. Important: This provides general information only, not legal advice.',
        '⚖️',
        '/tools/ai-voice-cloning-legality-checker',
        true,
        'AI Voice Cloning Legality Checker - Legal Risk Assessment Tool',
        'Assess legal risk of voice cloning based on voice source and use case. Get general legal guidance for celebrity voices, client voices, commercial use, and personal use. Understand right of publicity and when permission is required.',
        'voice cloning legality, ai voice legal, celebrity voice rights, right of publicity, voice cloning permission, ai voice legality checker, voice clone legal guide, commercial voice use, ai voice rights, voice cloning laws, voice ai legal advice, deepfake legality',
        'legal',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-voice-cloning-legality-checker',
        93
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
        'AI Voice Cloning Legality Checker',
        'ai-voice-cloning-legality-checker',
        'Assess the legal risk of voice cloning based on voice source (self, celebrity, client, public figure) and use case (personal, commercial). Get general legal guidance, recommendations, and risk assessments before cloning voices. Important: This provides general information only, not legal advice.',
        '⚖️',
        '/tools/ai-voice-cloning-legality-checker',
        true,
        'AI Voice Cloning Legality Checker - Legal Risk Assessment Tool',
        'Assess legal risk of voice cloning based on voice source and use case. Get general legal guidance for celebrity voices, client voices, commercial use, and personal use. Understand right of publicity and when permission is required.',
        'voice cloning legality, ai voice legal, celebrity voice rights, right of publicity, voice cloning permission, ai voice legality checker, voice clone legal guide, commercial voice use, ai voice rights, voice cloning laws, voice ai legal advice, deepfake legality',
        'legal',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-voice-cloning-legality-checker',
        93
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Voice Cloning Legality Checker tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIVoiceCloningLegalityCheckerTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

