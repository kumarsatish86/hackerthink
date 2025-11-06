-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id SERIAL PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message_content TEXT NOT NULL,
    inquiry_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    assigned_to INTEGER REFERENCES users(id),
    ip_address VARCHAR(45),
    attachments_url JSONB DEFAULT '[]'::jsonb,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for contact_inquiries
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_type ON contact_inquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_received_at ON contact_inquiries(received_at);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_assigned_to ON contact_inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_sender_email ON contact_inquiries(sender_email);

-- Create inquiry_types table
CREATE TABLE IF NOT EXISTS inquiry_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    email_recipient VARCHAR(255) NOT NULL,
    smtp_config_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create smtp_configs table
CREATE TABLE IF NOT EXISTS smtp_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN DEFAULT FALSE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for inquiry_types.smtp_config_id after smtp_configs table is created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'inquiry_types_smtp_config_id_fkey'
    ) THEN
        ALTER TABLE inquiry_types 
        ADD CONSTRAINT inquiry_types_smtp_config_id_fkey 
        FOREIGN KEY (smtp_config_id) REFERENCES smtp_configs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create contact_inquiry_notes table
CREATE TABLE IF NOT EXISTS contact_inquiry_notes (
    id SERIAL PRIMARY KEY,
    inquiry_id INTEGER NOT NULL REFERENCES contact_inquiries(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    note_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for contact_inquiry_notes
CREATE INDEX IF NOT EXISTS idx_contact_inquiry_notes_inquiry_id ON contact_inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiry_notes_user_id ON contact_inquiry_notes(user_id);

-- Create contact_settings table
CREATE TABLE IF NOT EXISTS contact_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default inquiry types
INSERT INTO inquiry_types (type_name, email_recipient) VALUES
    ('General Feedback', 'info@hackerthink.com'),
    ('Content Request / Suggest Article', 'editor@hackerthink.com'),
    ('Report a Bug', 'support@hackerthink.com'),
    ('Guest Post Inquiry', 'editor@hackerthink.com'),
    ('Sponsorship Inquiry', 'business@hackerthink.com'),
    ('Legal / Copyright', 'legal@hackerthink.com'),
    ('Technical Support', 'support@hackerthink.com'),
    ('Business Inquiry', 'business@hackerthink.com')
ON CONFLICT (type_name) DO NOTHING;

-- Insert default SMTP configuration from environment variables (if available)
-- This will be handled in the migration script, not in SQL
-- Insert default contact settings
INSERT INTO contact_settings (setting_key, setting_value) VALUES
    ('spam_protection_type', 'honeypot'),
    ('rate_limit_per_hour', '5'),
    ('max_file_size', '5242880'),
    ('default_smtp_config_id', NULL),
    ('admin_email', 'admin@hackerthink.com')
ON CONFLICT (setting_key) DO NOTHING;

