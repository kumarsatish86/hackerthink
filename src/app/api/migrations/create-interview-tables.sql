-- Create interview_categories table
CREATE TABLE IF NOT EXISTS interview_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_guests table
CREATE TABLE IF NOT EXISTS interview_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    photo_url VARCHAR(1000),
    title VARCHAR(255),
    company VARCHAR(255),
    company_url VARCHAR(500),
    designation VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    bio_summary TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    featured_image VARCHAR(1000),
    featured_image_alt VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    featured BOOLEAN DEFAULT FALSE,
    schedule_date TIMESTAMP,
    publish_date TIMESTAMP,
    interviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES interview_guests(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES interview_categories(id) ON DELETE SET NULL,
    interview_type VARCHAR(50) DEFAULT 'text' CHECK (interview_type IN ('text', 'video', 'podcast', 'mixed')),
    tags JSONB DEFAULT '[]',
    meta_title VARCHAR(500),
    meta_description TEXT,
    seo_keywords TEXT,
    schema_json JSONB,
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    estimated_reading_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_questions table (for question bank)
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    category VARCHAR(100),
    question_type VARCHAR(50) DEFAULT 'general',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create interview_comments table (if comments enabled)
CREATE TABLE IF NOT EXISTS interview_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES interview_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_guest_id ON interviews(guest_id);
CREATE INDEX IF NOT EXISTS idx_interviews_category_id ON interviews(category_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interview_type ON interviews(interview_type);
CREATE INDEX IF NOT EXISTS idx_interviews_featured ON interviews(featured);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);
CREATE INDEX IF NOT EXISTS idx_interviews_publish_date ON interviews(publish_date);
CREATE INDEX IF NOT EXISTS idx_interviews_slug ON interviews(slug);
CREATE INDEX IF NOT EXISTS idx_interview_guests_slug ON interview_guests(slug);
CREATE INDEX IF NOT EXISTS idx_interview_guests_name ON interview_guests(name);
CREATE INDEX IF NOT EXISTS idx_interview_comments_interview_id ON interview_comments(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_comments_user_id ON interview_comments(user_id);

-- Insert default interview categories
INSERT INTO interview_categories (name, slug, description) VALUES
('Expert Talks', 'expert-talks', 'Interviews with AI experts and thought leaders'),
('Founders', 'founders', 'Interviews with startup founders and CEOs'),
('Developers', 'developers', 'Interviews with AI developers and engineers'),
('Researchers', 'researchers', 'Interviews with AI researchers and scientists'),
('Innovators', 'innovators', 'Interviews with AI innovators and creators'),
('Community Voices', 'community-voices', 'Interviews with community members and educators')
ON CONFLICT (slug) DO NOTHING;

-- Update the updated_at timestamp trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_guests_updated_at ON interview_guests;
CREATE TRIGGER update_interview_guests_updated_at
    BEFORE UPDATE ON interview_guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_categories_updated_at ON interview_categories;
CREATE TRIGGER update_interview_categories_updated_at
    BEFORE UPDATE ON interview_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_comments_updated_at ON interview_comments;
CREATE TRIGGER update_interview_comments_updated_at
    BEFORE UPDATE ON interview_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

