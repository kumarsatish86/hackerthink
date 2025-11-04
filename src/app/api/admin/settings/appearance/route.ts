import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Pool } from 'pg';

// Configure PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Ensure the directory exists
async function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

// Check if site_settings table exists, create if not
async function ensureSiteSettingsTable() {
  const client = await pool.connect();
  try {
    // Check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating site_settings table...');
      await client.query(`
        CREATE TABLE site_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          setting_group VARCHAR(50),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('site_settings table created successfully');
    }
    return true;
  } catch (error) {
    console.error('Error ensuring site_settings table:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Fetch appearance settings from database
    console.log('Fetching appearance settings from database');
    const { rows } = await pool.query(`
      SELECT * FROM site_settings 
      WHERE setting_key IN ('logo_path', 'favicon_path', 'primary_color', 'secondary_color', 'footer_text', 'site_name')
    `);

    console.log('Found settings:', rows);

    // Convert to a more user-friendly format
    const settings = rows.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Get form data values
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;
    const footerText = formData.get('footerText') as string;
    
    console.log('Received form data:', { primaryColor, secondaryColor, footerText });
    
    // Initialize paths as empty
    let logoPath: string | null = null;
    let faviconPath: string | null = null;

    // Handle logo upload if a file is provided
    const logoFile = formData.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      try {
        console.log('Processing logo file:', logoFile.name, logoFile.size);
        const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
        const logoFileName = `logo-${Date.now()}${getFileExtension(logoFile.name)}`;
        const logoDir = join(process.cwd(), 'public', 'images');
        
        await ensureDir(logoDir);
        const logoFullPath = join(logoDir, logoFileName);
        await writeFile(logoFullPath, logoBuffer);
        
        logoPath = `/images/${logoFileName}`;
        console.log('Logo saved to:', logoPath);
      } catch (fileError) {
        console.error('Error saving logo file:', fileError);
        return NextResponse.json(
          { message: 'Error saving logo file', details: String(fileError) },
          { status: 500 }
        );
      }
    }

    // Handle favicon upload if a file is provided
    const faviconFile = formData.get('favicon') as File | null;
    if (faviconFile && faviconFile.size > 0) {
      try {
        console.log('Processing favicon file:', faviconFile.name, faviconFile.size);
        const faviconBuffer = Buffer.from(await faviconFile.arrayBuffer());
        const faviconFileName = `favicon${getFileExtension(faviconFile.name)}`;
        const faviconDir = join(process.cwd(), 'public');
        
        await ensureDir(faviconDir);
        const faviconFullPath = join(faviconDir, faviconFileName);
        await writeFile(faviconFullPath, faviconBuffer);
        
        faviconPath = `/${faviconFileName}`;
        console.log('Favicon saved to:', faviconPath);
      } catch (fileError) {
        console.error('Error saving favicon file:', fileError);
        return NextResponse.json(
          { message: 'Error saving favicon file', details: String(fileError) },
          { status: 500 }
        );
      }
    }

    // Update settings in database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Function to upsert a setting
      const upsertSetting = async (key: string, value: string) => {
        if (value) {
          console.log(`Upserting setting: ${key} = ${value}`);
          
          // Check if the setting exists first
          const exists = await client.query(`
            SELECT COUNT(*) FROM site_settings 
            WHERE setting_key = $1
          `, [key]);
          
          if (parseInt(exists.rows[0].count) > 0) {
            // Update existing setting
            await client.query(`
              UPDATE site_settings 
              SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
              WHERE setting_key = $1
            `, [key, value]);
          } else {
            // Insert new setting
            await client.query(`
              INSERT INTO site_settings (setting_key, setting_value, category, setting_group)
              VALUES ($1, $2, 'appearance', 'appearance')
            `, [key, value]);
          }
        }
      };

      // Update all the settings
      if (logoPath) await upsertSetting('logo_path', logoPath);
      if (faviconPath) await upsertSetting('favicon_path', faviconPath);
      if (primaryColor) await upsertSetting('primary_color', primaryColor);
      if (secondaryColor) await upsertSetting('secondary_color', secondaryColor);
      if (footerText) await upsertSetting('footer_text', footerText);

      await client.query('COMMIT');
      console.log('Database settings updated successfully');
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Database error:', dbError);
      throw dbError;
    } finally {
      client.release();
    }

    return NextResponse.json({ 
      message: 'Appearance settings updated successfully',
      settings: {
        logo_path: logoPath,
        favicon_path: faviconPath,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        footer_text: footerText
      }
    });
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
} 
