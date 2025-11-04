const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addRAGChunkingTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding RAG Chunking Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['rag-chunking-tool']
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
        WHERE slug = 'rag-chunking-tool'
      `, [
        'RAG Chunking / Text Splitter Tool',
        'Split long documents into optimized chunks for RAG (Retrieval-Augmented Generation) ingestion. Perfect for building chatbots on PDFs, document Q&A systems, and vector database preparation. Configure chunk size, overlap, and export as JSON, Markdown, or plain text. All processing happens in your browser - no backend required.',
        '✂️',
        '/tools/rag-chunking-tool',
        true,
        'RAG Chunking Tool - Text Splitter for Vector Databases | Document Chunking for LLMs',
        'Split documents into chunks for RAG ingestion. Optimize chunk sizes for vector databases, build chatbots on PDFs, prepare text for embedding generation. Configure character/token chunking with overlap. Export as JSON, Markdown, or text. Essential for LLM engineers and DevOps.',
        'rag chunking, text splitter, document chunking, rag tool, vector database preparation, text chunking tool, rag text splitter, document splitter, pdf chunking, llm chunking, embedding preparation, vector embedding chunks, chatbot text preparation, semantic search chunks, pinecone chunking, weaviate chunking',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/rag-chunking-tool',
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
        'RAG Chunking / Text Splitter Tool',
        'rag-chunking-tool',
        'Split long documents into optimized chunks for RAG (Retrieval-Augmented Generation) ingestion. Perfect for building chatbots on PDFs, document Q&A systems, and vector database preparation. Configure chunk size, overlap, and export as JSON, Markdown, or plain text. All processing happens in your browser - no backend required.',
        '✂️',
        '/tools/rag-chunking-tool',
        true,
        'RAG Chunking Tool - Text Splitter for Vector Databases | Document Chunking for LLMs',
        'Split documents into chunks for RAG ingestion. Optimize chunk sizes for vector databases, build chatbots on PDFs, prepare text for embedding generation. Configure character/token chunking with overlap. Export as JSON, Markdown, or text. Essential for LLM engineers and DevOps.',
        'rag chunking, text splitter, document chunking, rag tool, vector database preparation, text chunking tool, rag text splitter, document splitter, pdf chunking, llm chunking, embedding preparation, vector embedding chunks, chatbot text preparation, semantic search chunks, pinecone chunking, weaviate chunking',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/rag-chunking-tool',
        99
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 RAG Chunking Tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addRAGChunkingTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

