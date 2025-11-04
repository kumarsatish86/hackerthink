import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Category and platform mapping based on command names or descriptions
// This is a temporary solution until these fields are properly populated in the database
function enrichCommandData(command: any) {
  // Add additional metadata if missing
  return {
    ...command,
    category: command.category || inferCategory(command),
    platform: command.platform || 'linux',
    popularity: command.popularity || (75 + Math.floor(Math.random() * 20)), // Random between 75-95
    users_count: 5000 + Math.floor(Math.random() * 50000), // Random between 5000-55000
  };
}

function inferCategory(command: any) {
  const title = command.title.toLowerCase();
  const description = command.description?.toLowerCase() || '';
  
  // Default category
  let category = 'misc';
  
  // Infer category based on command name/description
  if (title.includes('file') || description.includes('file') || 
      title.includes('ls') || title.includes('mv') || title.includes('cp')) {
    category = 'file-management';
  } else if (title.includes('user') || description.includes('user') || 
            title.includes('passwd') || title.includes('useradd') || title.includes('userdel')) {
    category = 'user-management';
  } else if (title.includes('network') || description.includes('network') || 
            title.includes('ping') || title.includes('ifconfig') || title.includes('ssh')) {
    category = 'networking';
  } else if (title.includes('process') || description.includes('process') || 
            title.includes('ps') || title.includes('kill') || title.includes('top')) {
    category = 'process-management';
  } else if (title.includes('permission') || description.includes('permission') || 
            title.includes('chmod') || title.includes('chown')) {
    category = 'permissions';
  } else if (title.includes('package') || description.includes('package') || 
            title.includes('apt') || title.includes('yum') || title.includes('dnf')) {
    category = 'package-management';
  } else if (title.includes('system') || description.includes('system') || 
            title.includes('systemctl') || title.includes('reboot')) {
    category = 'system-management';
  }
  
  return category;
}

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Fetch all published commands
      const result = await client.query(`
        SELECT 
          id, 
          title, 
          slug, 
          description, 
          syntax,
          examples,
          category,
          platform,
          icon
        FROM commands 
        WHERE published = true 
        ORDER BY title ASC
      `);
      
      // Enrich the data with additional fields if needed
      const enrichedCommands = result.rows.map(enrichCommandData);
      
      return NextResponse.json({ commands: enrichedCommands });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
} 
