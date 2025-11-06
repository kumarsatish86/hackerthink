import { NextRequest, NextResponse } from 'next/server';

// GET endpoint to fetch settings for the contact form (public)
export async function GET(request: NextRequest) {
  try {
    const { query } = await import('@/lib/db');
    
    const spamProtectionResult = await query(
      "SELECT setting_value FROM contact_settings WHERE setting_key = 'spam_protection_type'"
    );
    
    const spamProtectionType = spamProtectionResult.rows.length > 0 
      ? (spamProtectionResult.rows[0].setting_value || 'honeypot')
      : 'honeypot';

    return NextResponse.json({
      spamProtectionType: spamProtectionType === 'recaptcha' ? 'recaptcha' : 'honeypot',
      recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json({
      spamProtectionType: 'honeypot',
      recaptchaSiteKey: '',
    });
  }
}

