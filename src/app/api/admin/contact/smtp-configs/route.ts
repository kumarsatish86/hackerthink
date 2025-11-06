import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

// Encrypt password
function encryptPassword(password: string, key: string): string {
  if (!key) {
    return password; // Not recommended for production
  }
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.substring(0, 32).padEnd(32, '0')), Buffer.alloc(16, 0));
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// GET: List SMTP configurations
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      'SELECT id, name, host, port, secure, username, from_email, from_name, is_default, is_active, created_at, updated_at FROM smtp_configs ORDER BY is_default DESC, name'
    );

    // Don't return passwords
    const configs = result.rows.map((config: any) => ({
      ...config,
      password: '***', // Mask password
    }));

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error('Error fetching SMTP configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMTP configurations' },
      { status: 500 }
    );
  }
}

// POST: Create SMTP configuration
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      host,
      port,
      secure = false,
      username,
      password,
      fromEmail,
      fromName,
      isDefault = false,
      isActive = true,
    } = body;

    if (!name || !host || !port || !username || !password || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await query('UPDATE smtp_configs SET is_default = FALSE WHERE is_default = TRUE');
    }

    // Encrypt password
    const encryptionKey = process.env.ENCRYPTION_KEY || '';
    const encryptedPassword = encryptPassword(password, encryptionKey);

    const result = await query(
      `INSERT INTO smtp_configs (
        name, host, port, secure, username, password, from_email, from_name,
        is_default, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, host, port, secure, username, from_email, from_name, is_default, is_active, created_at, updated_at`,
      [
        name,
        host,
        parseInt(port, 10),
        secure,
        username,
        encryptedPassword,
        fromEmail,
        fromName || null,
        isDefault,
        isActive,
      ]
    );

    const config = result.rows[0];
    config.password = '***'; // Mask password

    return NextResponse.json({ config }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating SMTP config:', error);
    return NextResponse.json(
      { error: 'Failed to create SMTP configuration' },
      { status: 500 }
    );
  }
}
