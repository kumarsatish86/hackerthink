const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIModelHardwareEstimatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Model Hardware Estimator Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-model-hardware-estimator']
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
        WHERE slug = 'ai-model-hardware-estimator'
      `, [
        'AI Model Size vs Hardware Estimator',
        'Calculate VRAM requirements for running local AI models. Select model (Llama, Mistral, Phi, Qwen, etc.) and precision (FP16, Q4_K_M, Q8_0, etc.) to see if your GPU can handle it. Answers questions like "Can I run Llama 70B on 24GB VRAM?" Perfect for choosing models and quantization before downloading.',
        '💾',
        '/tools/ai-model-hardware-estimator',
        true,
        'AI Model Hardware Estimator - VRAM Requirements Calculator | Can I Run Llama 70B?',
        'Calculate VRAM requirements for local AI models. Check if your GPU can run Llama 70B, Mistral, or other models. Select model size and quantization (FP16, Q4_K_M) to see exact VRAM needs. Perfect for choosing models before downloading. Supports Llama, Mistral, Phi, Qwen, and more.',
        'ai model vram calculator, llama vram requirements, can i run llama 70b, gpu vram calculator, ai model size calculator, llama hardware requirements, mistral vram, local ai model calculator, gpu memory calculator, ai model estimator, llama 3 vram, model quantization calculator, vram estimator, ai hardware calculator',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-model-hardware-estimator',
        99
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
        'AI Model Size vs Hardware Estimator',
        'ai-model-hardware-estimator',
        'Calculate VRAM requirements for running local AI models. Select model (Llama, Mistral, Phi, Qwen, etc.) and precision (FP16, Q4_K_M, Q8_0, etc.) to see if your GPU can handle it. Answers questions like "Can I run Llama 70B on 24GB VRAM?" Perfect for choosing models and quantization before downloading.',
        '💾',
        '/tools/ai-model-hardware-estimator',
        true,
        'AI Model Hardware Estimator - VRAM Requirements Calculator | Can I Run Llama 70B?',
        'Calculate VRAM requirements for local AI models. Check if your GPU can run Llama 70B, Mistral, or other models. Select model size and quantization (FP16, Q4_K_M) to see exact VRAM needs. Perfect for choosing models before downloading. Supports Llama, Mistral, Phi, Qwen, and more.',
        'ai model vram calculator, llama vram requirements, can i run llama 70b, gpu vram calculator, ai model size calculator, llama hardware requirements, mistral vram, local ai model calculator, gpu memory calculator, ai model estimator, llama 3 vram, model quantization calculator, vram estimator, ai hardware calculator',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-model-hardware-estimator',
        99
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Model Hardware Estimator tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIModelHardwareEstimatorTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

