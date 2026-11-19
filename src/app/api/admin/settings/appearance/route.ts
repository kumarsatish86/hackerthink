import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Pool } from 'pg';
import { isDatabaseAssetStorageEnabled } from '@/lib/assetStorageSettings';
import { siteAssetPublicUrl, upsertSiteAsset } from '@/lib/siteAssets';
import { invalidateSiteSettingsCache } from '@/lib/siteSettings';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

async function ensureSiteSettingsTable() {
  const client = await pool.connect();
  try {
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE site_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          category VARCHAR(50) NOT NULL DEFAULT 'appearance',
          setting_group VARCHAR(50),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      // Production DBs may require NOT NULL category
      await client.query(`
        ALTER TABLE site_settings
        ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'appearance'
      `);
      await client.query(`
        UPDATE site_settings SET category = 'appearance' WHERE category IS NULL
      `);
      await client.query(`
        ALTER TABLE site_settings
        ALTER COLUMN category SET DEFAULT 'appearance'
      `);
    }
    return true;
  } catch (error) {
    console.error('Error ensuring site_settings table:', error);
    return false;
  } finally {
    client.release();
  }
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}

function mimeFromFile(file: File, fallback: string): string {
  if (file.type) return file.type;
  const ext = getFileExtension(file.name).toLowerCase();
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
  };
  return map[ext] || fallback;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    await ensureSiteSettingsTable();

    const { rows } = await pool.query(`
      SELECT * FROM site_settings 
      WHERE setting_key IN ('logo_path', 'favicon_path', 'footer_logo_path', 'primary_color', 'secondary_color', 'footer_text', 'site_name')
    `);

    const settings = rows.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>);

    const databaseStorage = await isDatabaseAssetStorageEnabled();

    return NextResponse.json({
      settings,
      storage: {
        mode: databaseStorage ? 'database' : 'filesystem',
        databaseEnabled: databaseStorage,
      },
    });
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    await ensureSiteSettingsTable();

    const formData = await request.formData();
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;
    const footerText = formData.get('footerText') as string;

    let logoPath: string | null = null;
    let faviconPath: string | null = null;
    let footerLogoPath: string | null = null;
    const version = Date.now();
    const useDatabase = await isDatabaseAssetStorageEnabled();

    const saveImageAsset = async (
      file: File,
      key: 'logo' | 'favicon' | 'footer_logo',
      fallbackMime: string
    ): Promise<string> => {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (useDatabase) {
        const mime = mimeFromFile(file, fallbackMime);
        await upsertSiteAsset(key, mime, buffer, file.name);
        return siteAssetPublicUrl(key, version);
      }
      const fileName = `${key}-${version}${getFileExtension(file.name)}`;
      const dir = join(process.cwd(), 'public', 'images');
      await ensureDir(dir);
      await writeFile(join(dir, fileName), buffer);
      return `/images/${fileName}`;
    };

    const logoFile = formData.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      try {
        logoPath = await saveImageAsset(logoFile, 'logo', 'image/png');
      } catch (fileError) {
        console.error('Error saving logo file:', fileError);
        return NextResponse.json(
          {
            message: useDatabase
              ? 'Error saving logo to database'
              : 'Error saving logo file to disk. On serverless hosts, enable Database Asset Storage under Integrations → Other.',
            details: String(fileError),
          },
          { status: 500 }
        );
      }
    }

    const faviconFile = formData.get('favicon') as File | null;
    if (faviconFile && faviconFile.size > 0) {
      try {
        faviconPath = await saveImageAsset(faviconFile, 'favicon', 'image/x-icon');
      } catch (fileError) {
        console.error('Error saving favicon file:', fileError);
        return NextResponse.json(
          {
            message: useDatabase
              ? 'Error saving favicon to database'
              : 'Error saving favicon file to disk. On serverless hosts, enable Database Asset Storage under Integrations → Other.',
            details: String(fileError),
          },
          { status: 500 }
        );
      }
    }

    const footerLogoFile = formData.get('footerLogo') as File | null;
    if (footerLogoFile && footerLogoFile.size > 0) {
      try {
        footerLogoPath = await saveImageAsset(footerLogoFile, 'footer_logo', 'image/png');
      } catch (fileError) {
        console.error('Error saving footer logo file:', fileError);
        return NextResponse.json(
          {
            message: useDatabase
              ? 'Error saving footer logo to database'
              : 'Error saving footer logo file to disk. On serverless hosts, enable Database Asset Storage under Integrations → Other.',
            details: String(fileError),
          },
          { status: 500 }
        );
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const upsertSetting = async (key: string, value: string) => {
        if (!value) return;

        const exists = await client.query(
          `SELECT COUNT(*) FROM site_settings WHERE setting_key = $1`,
          [key]
        );

        if (parseInt(exists.rows[0].count) > 0) {
          await client.query(
            `
            UPDATE site_settings 
            SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
            WHERE setting_key = $1
            `,
            [key, value]
          );
        } else {
          // Production DB requires NOT NULL `category` (and may have setting_group)
          await client.query(
            `
            INSERT INTO site_settings (setting_key, setting_value, category, setting_group)
            VALUES ($1, $2, 'appearance', 'appearance')
            `,
            [key, value]
          );
        }
      };

      if (logoPath) await upsertSetting('logo_path', logoPath);
      if (faviconPath) await upsertSetting('favicon_path', faviconPath);
      if (footerLogoPath) await upsertSetting('footer_logo_path', footerLogoPath);
      if (primaryColor) await upsertSetting('primary_color', primaryColor);
      if (secondaryColor) await upsertSetting('secondary_color', secondaryColor);
      if (footerText) await upsertSetting('footer_text', footerText);

      await client.query('COMMIT');
      invalidateSiteSettingsCache();
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
        footer_logo_path: footerLogoPath,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        footer_text: footerText,
      },
      storage: {
        mode: useDatabase ? 'database' : 'filesystem',
        databaseEnabled: useDatabase,
      },
    });
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
