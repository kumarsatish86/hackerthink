import { query } from '@/lib/db';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Simple encryption/decryption for SMTP passwords
function encryptPassword(password: string, key: string): string {
  if (!key) {
    // If no encryption key, return as-is (not recommended for production)
    return password;
  }
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.substring(0, 32).padEnd(32, '0')), Buffer.alloc(16, 0));
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function createContactTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Creating contact module tables...');

    // Check users table id column type
    const usersIdTypeCheck = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'id'
    `);

    if (usersIdTypeCheck.rows.length === 0) {
      throw new Error('Users table does not exist or does not have an id column.');
    }

    const usersIdType = usersIdTypeCheck.rows[0].data_type;
    // Support both UUID and INTEGER/BIGINT for user IDs
    const userIdColumnType = usersIdType === 'uuid' ? 'UUID' : 'INTEGER';
    console.log(`Detected users.id type: ${usersIdType}, using ${userIdColumnType} for contact user_id columns`);

    // Read and execute the SQL file
    const sqlPath = path.join(process.cwd(), 'src/app/api/migrations/create-contact-tables.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Replace INTEGER with the detected type for user references
    sql = sql.replace(/assigned_to INTEGER REFERENCES users\(id\)/g, `assigned_to ${userIdColumnType} REFERENCES users(id)`);
    sql = sql.replace(/user_id INTEGER REFERENCES users\(id\)/g, `user_id ${userIdColumnType} REFERENCES users(id)`);
    
    // Execute SQL statements
    await client.query(sql);
    
    // Insert default SMTP configuration if environment variables are set
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@hackerthink.com';
    const smtpFromName = process.env.SMTP_FROM_NAME || 'HackerThink';
    const encryptionKey = process.env.ENCRYPTION_KEY || '';

    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      // Check if default SMTP config already exists
      const existingConfig = await client.query(
        'SELECT id FROM smtp_configs WHERE is_default = TRUE AND is_active = TRUE LIMIT 1'
      );

      if (existingConfig.rows.length === 0) {
        // Encrypt password
        const encryptedPassword = encryptPassword(smtpPassword, encryptionKey);

        // Insert default SMTP configuration
        await client.query(
          `INSERT INTO smtp_configs (name, host, port, secure, username, password, from_email, from_name, is_default, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT DO NOTHING`,
          [
            'Default SMTP',
            smtpHost,
            parseInt(smtpPort),
            parseInt(smtpPort) === 465,
            smtpUser,
            encryptedPassword,
            smtpFromEmail,
            smtpFromName,
            true,
            true
          ]
        );

        // Update contact_settings with default SMTP config ID
        const smtpConfigResult = await client.query(
          'SELECT id FROM smtp_configs WHERE is_default = TRUE AND is_active = TRUE LIMIT 1'
        );
        
        if (smtpConfigResult.rows.length > 0) {
          await client.query(
            'UPDATE contact_settings SET setting_value = $1 WHERE setting_key = $2',
            [smtpConfigResult.rows[0].id.toString(), 'default_smtp_config_id']
          );
        }

        console.log('Default SMTP configuration created from environment variables');
      }
    }

    // Update admin email setting if provided
    const adminEmail = process.env.CONTACT_ADMIN_EMAIL;
    if (adminEmail) {
      await client.query(
        'UPDATE contact_settings SET setting_value = $1 WHERE setting_key = $2',
        [adminEmail, 'admin_email']
      );
    }

    // Update rate limit if provided
    const rateLimit = process.env.CONTACT_RATE_LIMIT_PER_HOUR;
    if (rateLimit) {
      await client.query(
        'UPDATE contact_settings SET setting_value = $1 WHERE setting_key = $2',
        [rateLimit, 'rate_limit_per_hour']
      );
    }

    // Update spam protection type if provided
    const spamProtection = process.env.CONTACT_SPAM_PROTECTION;
    if (spamProtection && (spamProtection === 'honeypot' || spamProtection === 'recaptcha')) {
      await client.query(
        'UPDATE contact_settings SET setting_value = $1 WHERE setting_key = $2',
        [spamProtection, 'spam_protection_type']
      );
    }

    await client.query('COMMIT');
    console.log('Contact module tables created successfully!');
    
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating contact tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

