import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { testSMTPConnection } from '@/lib/email';
import crypto from 'crypto';

// Encrypt password
function encryptPassword(password: string, key: string): string {
  if (!key) {
    return password;
  }
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.substring(0, 32).padEnd(32, '0')), Buffer.alloc(16, 0));
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// GET: Get SMTP configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configId = parseInt(params.id, 10);
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid config ID' }, { status: 400 });
    }

    const result = await query(
      'SELECT id, name, host, port, secure, username, from_email, from_name, is_default, is_active, created_at, updated_at FROM smtp_configs WHERE id = $1',
      [configId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'SMTP configuration not found' }, { status: 404 });
    }

    const config = result.rows[0];
    config.password = '***'; // Mask password

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error('Error fetching SMTP config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMTP configuration' },
      { status: 500 }
    );
  }
}

// PATCH: Update SMTP configuration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configId = parseInt(params.id, 10);
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid config ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName,
      isDefault,
      isActive,
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (host !== undefined) {
      updates.push(`host = $${paramIndex}`);
      values.push(host);
      paramIndex++;
    }

    if (port !== undefined) {
      updates.push(`port = $${paramIndex}`);
      values.push(parseInt(port, 10));
      paramIndex++;
    }

    if (secure !== undefined) {
      updates.push(`secure = $${paramIndex}`);
      values.push(secure);
      paramIndex++;
    }

    if (username !== undefined) {
      updates.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }

    if (password !== undefined && password !== '***') {
      // Encrypt password
      const encryptionKey = process.env.ENCRYPTION_KEY || '';
      const encryptedPassword = encryptPassword(password, encryptionKey);
      updates.push(`password = $${paramIndex}`);
      values.push(encryptedPassword);
      paramIndex++;
    }

    if (fromEmail !== undefined) {
      updates.push(`from_email = $${paramIndex}`);
      values.push(fromEmail);
      paramIndex++;
    }

    if (fromName !== undefined) {
      updates.push(`from_name = $${paramIndex}`);
      values.push(fromName || null);
      paramIndex++;
    }

    if (isDefault !== undefined) {
      // If setting as default, unset other defaults
      if (isDefault) {
        await query('UPDATE smtp_configs SET is_default = FALSE WHERE is_default = TRUE AND id != $1', [configId]);
      }
      updates.push(`is_default = $${paramIndex}`);
      values.push(isDefault);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(configId);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await query(
      `UPDATE smtp_configs 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, host, port, secure, username, from_email, from_name, is_default, is_active, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'SMTP configuration not found' }, { status: 404 });
    }

    const config = result.rows[0];
    config.password = '***'; // Mask password

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error('Error updating SMTP config:', error);
    return NextResponse.json(
      { error: 'Failed to update SMTP configuration' },
      { status: 500 }
    );
  }
}

// DELETE: Delete SMTP configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configId = parseInt(params.id, 10);
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid config ID' }, { status: 400 });
    }

    // Check if it's the default config
    const defaultCheck = await query(
      'SELECT is_default FROM smtp_configs WHERE id = $1',
      [configId]
    );

    if (defaultCheck.rows.length === 0) {
      return NextResponse.json({ error: 'SMTP configuration not found' }, { status: 404 });
    }

    if (defaultCheck.rows[0].is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default SMTP configuration' },
        { status: 400 }
      );
    }

    // Check if it's being used by inquiry types
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM inquiry_types WHERE smtp_config_id = $1',
      [configId]
    );

    if (parseInt(usageCheck.rows[0].count, 10) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete SMTP configuration that is in use by inquiry types' },
        { status: 400 }
      );
    }

    await query('DELETE FROM smtp_configs WHERE id = $1', [configId]);

    return NextResponse.json({ success: true, message: 'SMTP configuration deleted' });
  } catch (error: any) {
    console.error('Error deleting SMTP config:', error);
    return NextResponse.json(
      { error: 'Failed to delete SMTP configuration' },
      { status: 500 }
    );
  }
}

// POST: Test SMTP connection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configId = parseInt(params.id, 10);
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid config ID' }, { status: 400 });
    }

    const testResult = await testSMTPConnection(configId);

    if (testResult.success) {
      return NextResponse.json({ success: true, message: 'SMTP connection test successful' });
    } else {
      return NextResponse.json(
        { success: false, error: testResult.error || 'SMTP connection test failed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error testing SMTP connection:', error);
    return NextResponse.json(
      { error: 'Failed to test SMTP connection' },
      { status: 500 }
    );
  }
}
