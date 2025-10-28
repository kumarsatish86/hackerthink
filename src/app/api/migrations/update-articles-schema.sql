-- Add new columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS schedule_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default categories
INSERT INTO categories (name, slug, description)
VALUES 
    ('Linux', 'linux', 'Articles about Linux operating system'),
    ('DevOps', 'devops', 'DevOps culture, tools, and practices'),
    ('Programming', 'programming', 'Programming tutorials and guides'),
    ('Cloud', 'cloud', 'Cloud computing and services'),
    ('Security', 'security', 'System and network security')
ON CONFLICT (name) DO NOTHING; 