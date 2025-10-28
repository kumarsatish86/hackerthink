// Script to clean up media database entries that reference non-existent files
import { query } from '../src/lib/db.js';
import { existsSync } from 'fs';
import { join } from 'path';

async function cleanupMediaDatabase() {
  try {
    console.log('Starting media database cleanup...');
    
    // Get all media entries
    const result = await query(`
      SELECT id, filename, filepath, original_filename 
      FROM media 
      ORDER BY upload_date DESC
    `);
    
    console.log(`Found ${result.rows.length} media entries in database`);
    
    let cleanedCount = 0;
    let existingCount = 0;
    
    for (const media of result.rows) {
      // Check if the file actually exists
      const fullPath = join(process.cwd(), 'public', media.filepath);
      const fileExists = existsSync(fullPath);
      
      if (!fileExists) {
        console.log(`❌ File not found: ${media.filepath} (${media.original_filename})`);
        
        // Delete the database entry
        await query('DELETE FROM media WHERE id = $1', [media.id]);
        cleanedCount++;
      } else {
        console.log(`✅ File exists: ${media.filepath} (${media.original_filename})`);
        existingCount++;
      }
    }
    
    console.log(`\nCleanup complete:`);
    console.log(`- Removed ${cleanedCount} entries for missing files`);
    console.log(`- Kept ${existingCount} entries for existing files`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupMediaDatabase();
