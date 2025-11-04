/**
 * Script to create AI Text Emotion Analyzer tool in the database
 * Run with: node scripts/create-ai-text-emotion-analyzer-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAITextEmotionAnalyzerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-text-emotion-analyzer']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Text Emotion Analyzer tool already exists in database');
      console.log('Tool ID:', existingCheck.rows[0].id);
      await client.query('COMMIT');
      return;
    }

    // Insert new tool
    const result = await client.query(`
      INSERT INTO tools (
        title, slug, description, icon, file_path, published,
        seo_title, seo_description, seo_keywords, schema_json,
        category, platform, license, official_url, popularity
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      'AI Text Emotion Analyzer (Heuristic)',
      'ai-text-emotion-analyzer',
      'Paste any text and analyze emotions using heuristic keyword analysis. Counts emotional keywords and detects tone (happy, angry, sad, fearful, surprised, etc.). Perfect for creators analyzing comments, emails, or social media posts to understand emotional sentiment.',
      'heart',
      '/tools/ai-text-emotion-analyzer',
      true, // Published by default
      'AI Text Emotion Analyzer - Analyze Emotions in Text | Sentiment Analysis Tool',
      'Analyze text emotions using keyword-based heuristic analysis. Detect happy, sad, angry, and other emotions in comments, emails, or social media posts. Perfect for creators and businesses analyzing sentiment and emotional tone.',
      'emotion analyzer, sentiment analysis, text emotion detector, emotion analysis tool, sentiment analyzer, text sentiment, emotional tone analyzer, comment analyzer, email emotion analyzer, social media sentiment, emotion detection, text analysis, heuristic emotion analysis',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Text Emotion Analyzer",
        "description": "Analyze emotions in text using heuristic keyword analysis",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }),
      'development',
      'cross-platform',
      'MIT',
      'https://ainews.com/tools/ai-text-emotion-analyzer',
      9 // High popularity (viral among creators)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Text Emotion Analyzer tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-text-emotion-analyzer');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Text Emotion Analyzer tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAITextEmotionAnalyzerTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

