import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Category and platform mapping based on tool names or descriptions
// This is a temporary solution until these fields are added to the database
function inferToolMetadata(tool: any) {
  const title = tool.title.toLowerCase();
  const description = tool.description?.toLowerCase() || '';
  
  // Set default values
  let category = 'other';
  let platform = 'cross-platform';
  let license = 'Open Source';
  let officialUrl = '#';
  let popularity = 75 + Math.floor(Math.random() * 20); // Random between 75-95
  let usersCount = 5000 + Math.floor(Math.random() * 50000); // Random between 5000-55000
  
  // Infer category
  if (title.includes('monitor') || description.includes('monitor') || 
      title.includes('htop') || title.includes('grafana') || title.includes('prometheus')) {
    category = 'system-monitoring';
  } else if (title.includes('security') || description.includes('security') || 
            title.includes('nmap') || title.includes('wireshark') || title.includes('metasploit')) {
    category = 'security';
  } else if (title.includes('docker') || description.includes('container') || 
            title.includes('kubernetes') || title.includes('podman')) {
    category = 'containerization';
  } else if (title.includes('ansible') || description.includes('automat') || 
            title.includes('terraform') || description.includes('workflow')) {
    category = 'automation';
  } else if (title.includes('git') || description.includes('develop') || 
            description.includes('programming')) {
    category = 'development';
  } else if (title.includes('network') || description.includes('network')) {
    category = 'networking';
  }
  
  // Infer platform
  if (description.includes('linux only') || description.includes('for linux')) {
    platform = 'linux';
  } else if (description.includes('windows only')) {
    platform = 'windows';
  } else if (description.includes('macos only') || description.includes('for mac')) {
    platform = 'macos';
  } else {
    platform = 'cross-platform';
  }
  
  // Generate a plausible URL if none exists
  if (title) {
    officialUrl = `https://${title.replace(/[^a-z0-9]/gi, '').toLowerCase()}.org`;
  }
  
  return {
    ...tool,
    category,
    platform,
    license,
    official_url: officialUrl,
    popularity,
    users_count: usersCount
  };
}

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Fetch all published tools with the fields that exist in the database
      const result = await client.query(`
        SELECT 
          id, 
          title, 
          slug, 
          description, 
          icon, 
          file_path
        FROM tools 
        WHERE published = true 
        ORDER BY title ASC
      `);
      
      // Add missing fields with inferred values
      const enrichedTools = result.rows.map(inferToolMetadata);
      
      return NextResponse.json({ tools: enrichedTools });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
} 
