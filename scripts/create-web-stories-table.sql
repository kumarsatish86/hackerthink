-- Create web_stories table
CREATE TABLE IF NOT EXISTS web_stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    cover_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    creation_method VARCHAR(20) DEFAULT 'manual' CHECK (creation_method IN ('manual', 'ai')),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_web_stories_slug ON web_stories(slug);

-- Create index on is_published for filtering
CREATE INDEX IF NOT EXISTS idx_web_stories_published ON web_stories(is_published);

-- Insert some sample data
INSERT INTO web_stories (title, slug, cover_image, is_published, creation_method, content) VALUES
('Getting Started with Linux', 'getting-started-with-linux', '/images/stories/linux-intro.jpg', true, 'manual', 'Learn the basics of Linux operating system'),
('Linux Command Line Basics', 'linux-command-line-basics', '/images/stories/command-line.jpg', false, 'ai', 'Master essential Linux command line tools and techniques')
ON CONFLICT (slug) DO NOTHING;
