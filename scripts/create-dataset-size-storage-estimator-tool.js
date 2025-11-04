/**
 * Script to create Dataset Size & Storage Estimator tool in the database
 * Run with: node scripts/create-dataset-size-storage-estimator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createDatasetSizeStorageEstimatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['dataset-size-storage-estimator', 'dataset-estimator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ Dataset Size & Storage Estimator tool already exists in database');
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
      'Dataset Size & Storage Estimator',
      'dataset-size-storage-estimator',
      'Enter number of records, average file size, and compression ratio to calculate approximate dataset size and monthly/yearly storage costs across different cloud providers (AWS S3, Google Cloud Storage, Azure Blob Storage). Perfect for AI developers and data engineers planning and optimizing storage costs.',
      'database',
      '/tools/dataset-size-storage-estimator',
      true, // Published by default
      'Dataset Size & Storage Estimator - Calculate Storage Costs | AI Developer Tool',
      'Calculate dataset size and storage costs across AWS S3, Google Cloud Storage, and Azure Blob Storage. Estimate monthly and yearly costs for your datasets. Perfect for AI developers planning and optimizing storage costs.',
      'dataset size estimator, storage cost calculator, dataset storage calculator, aws s3 cost calculator, gcs cost calculator, azure storage calculator, dataset size calculator, storage estimator, ai dataset planning, data storage cost, cloud storage calculator, dataset budget planner',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Dataset Size & Storage Estimator",
        "description": "Calculate dataset size and storage costs across cloud providers",
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
      'https://ainews.com/tools/dataset-size-storage-estimator',
      10 // Maximum popularity (highly practical for AI devs)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ Dataset Size & Storage Estimator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/dataset-size-storage-estimator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating Dataset Size & Storage Estimator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createDatasetSizeStorageEstimatorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

