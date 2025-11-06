import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get contact module settings
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      "SELECT setting_key, setting_value FROM contact_settings"
    );

    const settings: any = {};
    result.rows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    // Add reCAPTCHA site key (public)
    settings.recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH: Update contact module settings
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      spamProtectionType,
      rateLimitPerHour,
      maxFileSize,
      defaultSmtpConfigId,
      adminEmail,
    } = body;

    const updates: Array<{ key: string; value: string }> = [];

    if (spamProtectionType !== undefined) {
      if (spamProtectionType !== 'honeypot' && spamProtectionType !== 'recaptcha') {
        return NextResponse.json(
          { error: 'Invalid spam protection type. Must be "honeypot" or "recaptcha"' },
          { status: 400 }
        );
      }
      updates.push({ key: 'spam_protection_type', value: spamProtectionType });
    }

    if (rateLimitPerHour !== undefined) {
      const rateLimit = parseInt(rateLimitPerHour, 10);
      if (isNaN(rateLimit) || rateLimit < 1) {
        return NextResponse.json(
          { error: 'Rate limit must be a positive number' },
          { status: 400 }
        );
      }
      updates.push({ key: 'rate_limit_per_hour', value: rateLimit.toString() });
    }

    if (maxFileSize !== undefined) {
      const fileSize = parseInt(maxFileSize, 10);
      if (isNaN(fileSize) || fileSize < 0) {
        return NextResponse.json(
          { error: 'Max file size must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.push({ key: 'max_file_size', value: fileSize.toString() });
    }

    if (defaultSmtpConfigId !== undefined) {
      // Validate that the SMTP config exists
      if (defaultSmtpConfigId) {
        const configCheck = await query(
          'SELECT id FROM smtp_configs WHERE id = $1 AND is_active = TRUE',
          [defaultSmtpConfigId]
        );
        if (configCheck.rows.length === 0) {
          return NextResponse.json(
            { error: 'Invalid SMTP configuration ID' },
            { status: 400 }
          );
        }
      }
      updates.push({ key: 'default_smtp_config_id', value: defaultSmtpConfigId?.toString() || null });
    }

    if (adminEmail !== undefined) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmail)) {
        return NextResponse.json(
          { error: 'Invalid admin email format' },
          { status: 400 }
        );
      }
      updates.push({ key: 'admin_email', value: adminEmail });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No settings to update' }, { status: 400 });
    }

    // Update settings
    for (const update of updates) {
      await query(
        `INSERT INTO contact_settings (setting_key, setting_value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [update.key, update.value]
      );
    }

    // Get updated settings
    const result = await query(
      "SELECT setting_key, setting_value FROM contact_settings"
    );

    const settings: any = {};
    result.rows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    settings.recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
