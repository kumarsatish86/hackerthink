/**
 * Script to create AI Resume / Cover Letter Prompt Generator tool in the database
 * Run with: node scripts/create-ai-resume-cover-letter-generator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIResumeCoverLetterGeneratorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2, $3)',
      ['ai-resume-cover-letter-generator', 'ai-resume-generator', 'ai-cover-letter-generator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Resume / Cover Letter Generator tool already exists in database');
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
      'AI Resume / Cover Letter Prompt Generator',
      'ai-resume-cover-letter-generator',
      'Generate optimized prompts for creating professional resumes and cover letters using AI. Enter job title, experience level, key skills, and tone to get comprehensive prompts for ChatGPT that generate ATS-friendly, tailored resumes and compelling cover letters.',
      'file-text',
      '/tools/ai-resume-cover-letter-generator',
      true, // Published by default
      'AI Resume & Cover Letter Generator - Create Professional Resumes with ChatGPT | Free Tool',
      'Generate AI-powered resume and cover letter prompts for ChatGPT. Create professional, ATS-friendly resumes and compelling cover letters tailored to any job. Perfect for job seekers looking for AI-powered resume creation.',
      'ai resume generator, ai cover letter generator, chatgpt resume, ai resume maker, resume prompt generator, cover letter prompt generator, ai powered resume, ats resume generator, professional resume generator, ai resume builder, resume writer ai, job application ai',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Resume / Cover Letter Prompt Generator",
        "description": "Generate optimized prompts for creating professional resumes and cover letters using AI",
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
      'https://ainews.com/tools/ai-resume-cover-letter-generator',
      10 // Maximum popularity (high viral potential - every job seeker wants this)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Resume / Cover Letter Prompt Generator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-resume-cover-letter-generator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Resume / Cover Letter Generator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIResumeCoverLetterGeneratorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

