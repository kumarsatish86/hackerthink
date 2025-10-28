-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(1000),
    featured_image_alt VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    schedule_date TIMESTAMP,
    publish_date TIMESTAMP,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES news_categories(id) ON DELETE SET NULL,
    co_authors JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    meta_title VARCHAR(500),
    meta_description TEXT,
    seo_keywords TEXT,
    seo_graphs TEXT,
    seo_schema TEXT,
    schema_json JSONB,
    estimated_reading_time INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_category_id ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON news(publish_date);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

-- Insert some default news categories
INSERT INTO news_categories (name, slug, description) VALUES
('Technology', 'technology', 'Latest technology news and updates'),
('Artificial Intelligence', 'artificial-intelligence', 'AI research, developments, and applications'),
('Business', 'business', 'Business news and market updates'),
('Research', 'research', 'Scientific research and academic news'),
('Startups', 'startups', 'Startup news and funding updates'),
('Global News', 'global-news', 'International news and global events')
ON CONFLICT (slug) DO NOTHING;

-- Insert some sample news items (without author_id for now since we need to get a valid UUID)
INSERT INTO news (title, slug, content, excerpt, status, category_id, tags, meta_title, meta_description) VALUES
(
    'OpenAI Announces GPT-5 with Multimodal Capabilities',
    'openai-announces-gpt-5-multimodal-capabilities',
    '<p>OpenAI has officially announced the development of GPT-5, their next-generation large language model that promises revolutionary improvements in reasoning and multimodal understanding.</p><p>The new model is expected to surpass current AI capabilities in various domains including natural language processing, computer vision, and complex reasoning tasks.</p>',
    'The next generation of large language models promises revolutionary improvements in reasoning and multimodal understanding.',
    'published',
    2,
    '["GPT-5", "OpenAI", "AI", "Multimodal"]',
    'OpenAI Announces GPT-5 with Multimodal Capabilities',
    'OpenAI has officially announced the development of GPT-5, their next-generation large language model with revolutionary improvements.'
),
(
    'Google''s Gemini Pro 2.0 Surpasses Human Performance in Coding',
    'google-gemini-pro-2-0-coding-performance',
    '<p>Google has released Gemini Pro 2.0, which has achieved unprecedented results in software development tasks, surpassing human performance in various coding benchmarks.</p><p>The model shows significant improvements in code generation, debugging, and software architecture design.</p>',
    'New benchmarks show Google''s latest AI model achieving unprecedented results in software development tasks.',
    'published',
    2,
    '["Gemini Pro", "Google", "Coding", "AI"]',
    'Google''s Gemini Pro 2.0 Surpasses Human Performance in Coding',
    'Google''s Gemini Pro 2.0 has achieved unprecedented results in software development tasks, surpassing human performance.'
),
(
    'EU AI Act Implementation Begins: What It Means for Developers',
    'eu-ai-act-implementation-developers',
    '<p>The European Union''s comprehensive AI regulation framework has officially taken effect, impacting AI development across the continent.</p><p>Developers and companies need to understand the new compliance requirements and how they affect AI system development and deployment.</p>',
    'The European Union''s comprehensive AI regulation framework takes effect, impacting AI development across the continent.',
    'published',
    4,
    '["EU AI Act", "Regulation", "Compliance", "AI Policy"]',
    'EU AI Act Implementation Begins: What It Means for Developers',
    'The EU AI Act has officially taken effect, impacting AI development across Europe with new compliance requirements.'
)
ON CONFLICT (slug) DO NOTHING;

-- Update the updated_at timestamp trigger for news table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for news table
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for news_categories table
DROP TRIGGER IF EXISTS update_news_categories_updated_at ON news_categories;
CREATE TRIGGER update_news_categories_updated_at
    BEFORE UPDATE ON news_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
