# Contact Us Module - Implementation Complete

## Overview
The Contact Us module has been successfully implemented with all features from the plan. This document provides a quick guide to get started.

## Quick Start

### 1. Run Database Migration

First, create the database tables by running:

```bash
npm run db:contact-migrate
```

Or manually:
```bash
tsx src/app/api/migrations/run-contact-migration.ts
```

This will create:
- `contact_inquiries` - Stores all contact form submissions
- `inquiry_types` - Configurable inquiry types (General Feedback, Bug Reports, etc.)
- `smtp_configs` - Multiple SMTP email configurations
- `contact_inquiry_notes` - Admin notes on inquiries
- `contact_settings` - Module settings (spam protection, rate limits, etc.)

### 2. Configure Environment Variables

Update your `.env` file with email and optional reCAPTCHA settings:

```env
# Email Configuration (Default SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@hackerthink.com
SMTP_FROM_NAME=HackerThink

# reCAPTCHA (Optional - only needed if using reCAPTCHA instead of Honeypot)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Contact Module
CONTACT_ADMIN_EMAIL=admin@hackerthink.com
CONTACT_MAX_FILE_SIZE=5242880
CONTACT_RATE_LIMIT_PER_HOUR=5
CONTACT_SPAM_PROTECTION=honeypot

# Encryption (for SMTP passwords)
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Access the Module

- **Public Contact Form**: Visit `/contact` to see the contact form
- **Admin Dashboard**: Visit `/admin/contact` to manage inquiries
- **Inquiry Types**: Visit `/admin/contact/types` to manage inquiry types
- **SMTP Configs**: Visit `/admin/contact/smtp-configs` to manage email configurations
- **Settings**: Visit `/admin/contact/settings` to configure module settings

## Features

### Public Features
- ✅ User-friendly contact form with validation
- ✅ Multiple inquiry types (configurable)
- ✅ Spam protection (Honeypot or reCAPTCHA v3)
- ✅ Rate limiting (configurable per IP)
- ✅ Email confirmations to users
- ✅ Email notifications to admins

### Admin Features
- ✅ Centralized inbox for all inquiries
- ✅ Filtering and search capabilities
- ✅ Status management (new, in_progress, resolved, archived)
- ✅ Assignment to team members
- ✅ Notes system for internal communication
- ✅ Inquiry type management
- ✅ Multiple SMTP configurations with fallback
- ✅ Statistics dashboard
- ✅ Settings management

## Default Inquiry Types

The migration creates these default inquiry types:
- General Feedback
- Content Request / Suggest Article
- Report a Bug
- Guest Post Inquiry
- Sponsorship Inquiry
- Legal / Copyright
- Technical Support
- Business Inquiry

You can add, edit, or delete these in the admin panel.

## Spam Protection

The module supports two spam protection methods:

1. **Honeypot (Default)**: Uses a hidden field that bots typically fill out. No external service required.
2. **Google reCAPTCHA v3**: Invisible CAPTCHA that scores user behavior. Requires API keys.

Configure in `/admin/contact/settings`.

## Email Configuration

### Single SMTP (Environment Variables)
Set SMTP credentials in `.env` file. The migration will create a default SMTP configuration.

### Multiple SMTP Configurations
1. Go to `/admin/contact/smtp-configs`
2. Add multiple SMTP configurations
3. Assign specific SMTP configs to inquiry types
4. System will fallback to default if primary fails

## Security Features

- ✅ Input sanitization (XSS prevention)
- ✅ CSRF protection (Next.js built-in)
- ✅ Rate limiting (IP-based)
- ✅ Email header injection prevention
- ✅ SMTP password encryption
- ✅ Spam protection (Honeypot/reCAPTCHA)

## API Endpoints

### Public
- `POST /api/contact` - Submit contact form
- `GET /api/contact/settings` - Get form settings

### Admin (Requires authentication)
- `GET /api/admin/contact` - List inquiries
- `POST /api/admin/contact` - Create inquiry manually
- `GET /api/admin/contact/[id]` - Get inquiry details
- `PATCH /api/admin/contact/[id]` - Update inquiry
- `DELETE /api/admin/contact/[id]` - Archive inquiry
- `GET /api/admin/contact/stats` - Get statistics
- `GET /api/admin/contact/types` - List inquiry types
- `POST /api/admin/contact/types` - Create inquiry type
- `PATCH /api/admin/contact/types` - Update inquiry type
- `DELETE /api/admin/contact/types` - Delete inquiry type
- `GET /api/admin/contact/smtp-configs` - List SMTP configs
- `POST /api/admin/contact/smtp-configs` - Create SMTP config
- `PATCH /api/admin/contact/smtp-configs/[id]` - Update SMTP config
- `DELETE /api/admin/contact/smtp-configs/[id]` - Delete SMTP config
- `POST /api/admin/contact/smtp-configs/[id]` - Test SMTP connection
- `GET /api/admin/contact/settings` - Get settings
- `PATCH /api/admin/contact/settings` - Update settings

## Troubleshooting

### Tables not created
- Run the migration: `npm run db:contact-migrate`
- Check database connection in `.env`
- Verify database user has CREATE TABLE permissions

### Emails not sending
- Check SMTP credentials in `.env` or admin panel
- Test SMTP connection in `/admin/contact/smtp-configs`
- Check email service logs
- Verify firewall/network allows SMTP connections

### reCAPTCHA not working
- Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` are set
- Check that reCAPTCHA is enabled in settings
- Ensure GoogleReCaptchaProvider is configured in `src/app/providers.tsx`

### Rate limiting issues
- Adjust rate limit in `/admin/contact/settings`
- Check IP address detection (may need proxy configuration)

## Next Steps

1. ✅ Run database migration
2. ✅ Configure environment variables
3. ✅ Test contact form at `/contact`
4. ✅ Configure inquiry types in admin panel
5. ✅ Set up SMTP configurations
6. ✅ Test email sending
7. ✅ Customize email templates if needed

## Support

For issues or questions:
- Check the admin dashboard for inquiry statistics
- Review server logs for errors
- Test SMTP connections in the admin panel
- Verify all environment variables are set correctly

