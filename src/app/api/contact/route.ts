import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { validateContactForm } from '@/lib/contactValidation';
import { validateHoneypot } from '@/lib/honeypot';
import { verifyRecaptcha, getSpamProtectionType } from '@/lib/recaptcha';
import { getClientIP, checkRateLimit, getRateLimitSettings } from '@/lib/rateLimit';
import { sendEmail, getUserConfirmationEmail, getAdminNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimitSettings = await getRateLimitSettings();
    const rateLimitCheck = await checkRateLimit(
      clientIP,
      rateLimitSettings.maxRequests,
      rateLimitSettings.windowMs
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate form data
    const validation = validateContactForm(body);
    
    if (!validation.isValid || !validation.sanitized) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const formData = validation.sanitized;

    // Check spam protection
    const spamProtectionType = await getSpamProtectionType();
    
    if (spamProtectionType === 'honeypot') {
      // Validate honeypot
      if (!validateHoneypot(formData.honeypot)) {
        // Bot detected, silently fail (return success to avoid revealing honeypot)
        return NextResponse.json({ success: true, message: 'Thank you for your message!' });
      }
    } else if (spamProtectionType === 'recaptcha') {
      // Verify reCAPTCHA token
      if (!formData.recaptchaToken) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification required' },
          { status: 400 }
        );
      }

      const recaptchaResult = await verifyRecaptcha(formData.recaptchaToken);
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Get inquiry type details
    const inquiryTypeResult = await query(
      'SELECT id, type_name, email_recipient, smtp_config_id FROM inquiry_types WHERE type_name = $1 AND is_active = TRUE',
      [formData.inquiryType]
    );

    if (inquiryTypeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid inquiry type' },
        { status: 400 }
      );
    }

    const inquiryType = inquiryTypeResult.rows[0];

    // Insert inquiry into database
    const insertResult = await query(
      `INSERT INTO contact_inquiries (
        sender_name, sender_email, subject, message_content, inquiry_type, 
        status, ip_address, received_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        formData.senderName,
        formData.senderEmail,
        formData.subject,
        formData.messageContent,
        formData.inquiryType,
        'new',
        clientIP,
      ]
    );

    const inquiryId = insertResult.rows[0].id;

    // Get admin email and base URL
    const settingsResult = await query(
      "SELECT setting_value FROM contact_settings WHERE setting_key = 'admin_email'"
    );
    const adminEmail = settingsResult.rows.length > 0 
      ? settingsResult.rows[0].setting_value 
      : 'admin@hackerthink.com';

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';
    const adminUrl = `${baseUrl}/admin/contact/${inquiryId}`;

    // Send confirmation email to user
    const confirmationEmail = getUserConfirmationEmail({
      senderName: formData.senderName,
      subject: formData.subject,
      inquiryType: formData.inquiryType,
    });

    await sendEmail({
      to: formData.senderEmail,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
      text: confirmationEmail.text,
      smtpConfigId: inquiryType.smtp_config_id || undefined,
    });

    // Send notification email to admin
    const notificationEmail = getAdminNotificationEmail({
      senderName: formData.senderName,
      senderEmail: formData.senderEmail,
      subject: formData.subject,
      message: formData.messageContent,
      inquiryType: formData.inquiryType,
      inquiryId,
      adminUrl,
    });

    await sendEmail({
      to: inquiryType.email_recipient,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
      text: notificationEmail.text,
      smtpConfigId: inquiryType.smtp_config_id || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      inquiryId,
    });
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch settings for the form
export async function GET(request: NextRequest) {
  try {
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
