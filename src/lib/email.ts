import nodemailer from 'nodemailer';
import { query } from './db';
import crypto from 'crypto';

interface SMTPConfig {
  id: number;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_default: boolean;
  is_active: boolean;
}

// Decrypt password
function decryptPassword(encryptedPassword: string, key: string): string {
  if (!key) {
    return encryptedPassword;
  }
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.substring(0, 32).padEnd(32, '0')), Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, return as-is (might be plain text)
    return encryptedPassword;
  }
}

// Get SMTP configuration by ID or default
async function getSMTPConfig(configId?: number): Promise<SMTPConfig | null> {
  try {
    let config: SMTPConfig | null = null;

    if (configId) {
      const result = await query(
        'SELECT * FROM smtp_configs WHERE id = $1 AND is_active = TRUE',
        [configId]
      );
      if (result.rows.length > 0) {
        config = result.rows[0];
      }
    }

    // If no config found or no ID provided, get default
    if (!config) {
      const defaultResult = await query(
        'SELECT * FROM smtp_configs WHERE is_default = TRUE AND is_active = TRUE LIMIT 1'
      );
      if (defaultResult.rows.length > 0) {
        config = defaultResult.rows[0];
      }
    }

    // Fallback to environment variables if no DB config found
    if (!config) {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;
      const smtpFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@hackerthink.com';
      const smtpFromName = process.env.SMTP_FROM_NAME || 'HackerThink';

      if (smtpHost && smtpPort && smtpUser && smtpPassword) {
        return {
          id: 0,
          name: 'Environment SMTP',
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: parseInt(smtpPort) === 465,
          username: smtpUser,
          password: smtpPassword,
          from_email: smtpFromEmail,
          from_name: smtpFromName,
          is_default: true,
          is_active: true,
        };
      }
    }

    return config;
  } catch (error) {
    console.error('Error getting SMTP config:', error);
    return null;
  }
}

// Create transporter from SMTP config
async function createTransporter(configId?: number): Promise<nodemailer.Transporter | null> {
  const config = await getSMTPConfig(configId);
  
  if (!config) {
    console.error('No SMTP configuration found');
    return null;
  }

  const encryptionKey = process.env.ENCRYPTION_KEY || '';
  const decryptedPassword = decryptPassword(config.password, encryptionKey);

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: decryptedPassword,
      },
    });

    // Verify connection
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error('Error creating transporter:', error);
    return null;
  }
}

// Send email with fallback to next SMTP config if primary fails
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  smtpConfigId?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text, from, fromName, smtpConfigId } = options;

  try {
    const config = await getSMTPConfig(smtpConfigId);
    if (!config) {
      return { success: false, error: 'No SMTP configuration available' };
    }

    const transporter = await createTransporter(smtpConfigId);
    if (!transporter) {
      return { success: false, error: 'Failed to create email transporter' };
    }

    const mailOptions = {
      from: from || `${config.from_name || 'HackerThink'} <${config.from_email}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Try fallback to default SMTP if using custom config
    if (smtpConfigId) {
      console.log('Attempting fallback to default SMTP...');
      return sendEmail({ ...options, smtpConfigId: undefined });
    }

    return { success: false, error: error.message || 'Failed to send email' };
  }
}

// Email templates
export function getUserConfirmationEmail(data: {
  senderName: string;
  subject: string;
  inquiryType: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Thank you for contacting HackerThink';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting Us</h1>
        </div>
        <div class="content">
          <p>Dear ${data.senderName},</p>
          <p>We have received your inquiry and want to thank you for reaching out to HackerThink.</p>
          <p><strong>Inquiry Details:</strong></p>
          <ul>
            <li><strong>Type:</strong> ${data.inquiryType}</li>
            <li><strong>Subject:</strong> ${data.subject}</li>
          </ul>
          <p>Our team will review your message and get back to you as soon as possible. We typically respond within 24-48 hours.</p>
          <p>If you have any urgent concerns, please don't hesitate to contact us directly.</p>
          <p>Best regards,<br>The HackerThink Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Thank You for Contacting Us

Dear ${data.senderName},

We have received your inquiry and want to thank you for reaching out to HackerThink.

Inquiry Details:
- Type: ${data.inquiryType}
- Subject: ${data.subject}

Our team will review your message and get back to you as soon as possible. We typically respond within 24-48 hours.

If you have any urgent concerns, please don't hesitate to contact us directly.

Best regards,
The HackerThink Team

---
This is an automated message. Please do not reply to this email.
  `;

  return { subject, html, text };
}

export function getAdminNotificationEmail(data: {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  inquiryType: string;
  inquiryId: number;
  adminUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `New Contact Inquiry: ${data.inquiryType} - ${data.subject}`;
  const adminLink = `${data.adminUrl}/admin/contact/${data.inquiryId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Inquiry</h1>
        </div>
        <div class="content">
          <p>A new contact inquiry has been submitted through the website.</p>
          <div class="details">
            <p><strong>From:</strong> ${data.senderName} (${data.senderEmail})</p>
            <p><strong>Type:</strong> ${data.inquiryType}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 4px;">${data.message}</p>
          </div>
          <a href="${adminLink}" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from HackerThink Contact System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New Contact Inquiry

A new contact inquiry has been submitted through the website.

From: ${data.senderName} (${data.senderEmail})
Type: ${data.inquiryType}
Subject: ${data.subject}

Message:
${data.message}

View in Admin Dashboard: ${adminLink}

---
This is an automated notification from HackerThink Contact System.
  `;

  return { subject, html, text };
}

// Test SMTP connection
export async function testSMTPConnection(configId?: number): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = await createTransporter(configId);
    if (!transporter) {
      return { success: false, error: 'Failed to create transporter' };
    }
    
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'SMTP connection test failed' };
  }
}
