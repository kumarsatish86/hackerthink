-- Create products table for AI tools directory (simplified version)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    logo_alt VARCHAR(255),
    short_description TEXT,
    full_description TEXT,
    pricing_type VARCHAR(50) DEFAULT 'free', -- free, freemium, paid, enterprise
    pricing_details JSONB, -- Store pricing tiers, plans, etc.
    website_url VARCHAR(500),
    demo_url VARCHAR(500),
    documentation_url VARCHAR(500),
    github_url VARCHAR(500),
    integrations JSONB, -- Array of integration names/platforms
    pros JSONB, -- Array of pros
    cons JSONB, -- Array of cons
    features JSONB, -- Array of key features
    categories JSONB, -- Array of category names
    tags JSONB, -- Array of tags
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00, -- Overall rating out of 5
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    launch_date DATE,
    last_updated DATE,
    company_name VARCHAR(255),
    company_size VARCHAR(50), -- startup, small, medium, large, enterprise
    founded_year INTEGER,
    headquarters VARCHAR(255),
    social_links JSONB, -- Twitter, LinkedIn, etc.
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    schema_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_pricing_type ON products(pricing_type);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Insert sample data
INSERT INTO products (
    name, slug, logo_url, short_description, full_description, 
    pricing_type, pricing_details, website_url, integrations, 
    pros, cons, features, categories, tags, status, featured,
    rating, company_name, seo_title, seo_description
) VALUES 
(
    'OpenAI GPT-4',
    'openai-gpt-4',
    '/images/products/openai-gpt4.png',
    'Advanced AI language model with multimodal capabilities',
    'GPT-4 is OpenAI''s most advanced AI system, capable of understanding and generating both text and images. It excels at complex reasoning, creative writing, and problem-solving across various domains.',
    'paid',
    '{"plans": [{"name": "GPT-4", "price": 20, "currency": "USD", "period": "month", "features": ["GPT-4 access", "Image analysis", "Code generation"]}]}',
    'https://openai.com',
    '["API", "ChatGPT", "Microsoft Copilot", "GitHub Copilot"]',
    '["State-of-the-art performance", "Multimodal capabilities", "Strong reasoning", "Large context window"]',
    '["Expensive", "Rate limits", "Not always available"]',
    '["Text generation", "Code completion", "Image analysis", "Conversational AI", "Translation"]',
    '["AI Models", "Language Processing", "Developer Tools"]',
    '["AI", "GPT", "Language Model", "OpenAI", "NLP"]',
    'published',
    true,
    4.8,
    'OpenAI',
    'OpenAI GPT-4 - Advanced AI Language Model',
    'Discover GPT-4, OpenAI''s most advanced AI system with multimodal capabilities for text and image understanding.'
),
(
    'Anthropic Claude',
    'anthropic-claude',
    '/images/products/anthropic-claude.png',
    'AI assistant focused on helpfulness, harmlessness, and honesty',
    'Claude is an AI assistant developed by Anthropic, designed to be helpful, harmless, and honest. It excels at analysis, writing, math, coding, and creative tasks while maintaining safety standards.',
    'freemium',
    '{"plans": [{"name": "Claude Free", "price": 0, "currency": "USD", "period": "month", "features": ["Basic Claude access", "Limited usage"]}, {"name": "Claude Pro", "price": 20, "currency": "USD", "period": "month", "features": ["Unlimited access", "Priority processing", "Advanced features"]}]}',
    'https://claude.ai',
    '["API", "Slack", "Notion", "Google Workspace"]',
    '["Safety-focused", "Helpful responses", "Good at analysis", "Ethical AI"]',
    '["Limited free tier", "Conservative responses", "Newer platform"]',
    '["Text analysis", "Writing assistance", "Code review", "Research", "Creative writing"]',
    '["AI Models", "Language Processing", "Productivity"]',
    '["AI", "Claude", "Anthropic", "Assistant", "Safety"]',
    'published',
    true,
    4.6,
    'Anthropic',
    'Anthropic Claude - Safe AI Assistant',
    'Meet Claude, Anthropic''s AI assistant designed for helpfulness, harmlessness, and honesty in AI interactions.'
),
(
    'GitHub Copilot',
    'github-copilot',
    '/images/products/github-copilot.png',
    'AI-powered code completion and generation tool',
    'GitHub Copilot is an AI pair programmer that helps you write code faster and with fewer errors. It suggests code and entire functions in real-time as you type, supporting multiple programming languages.',
    'paid',
    '{"plans": [{"name": "Individual", "price": 10, "currency": "USD", "period": "month", "features": ["Code completion", "Chat assistance", "Multi-language support"]}, {"name": "Business", "price": 19, "currency": "USD", "period": "month", "features": ["Team management", "Security features", "Priority support"]}]}',
    'https://github.com/features/copilot',
    '["VS Code", "JetBrains", "Neovim", "Visual Studio", "GitHub"]',
    '["Fast code completion", "Multi-language support", "Learns from context", "IDE integration"]',
    '["Subscription cost", "Internet required", "Code quality varies"]',
    '["Code completion", "Code generation", "Documentation", "Testing", "Debugging"]',
    '["Developer Tools", "AI Coding", "Productivity"]',
    '["AI", "Coding", "GitHub", "Copilot", "Developer"]',
    'published',
    true,
    4.4,
    'GitHub',
    'GitHub Copilot - AI Pair Programmer',
    'Accelerate your coding with GitHub Copilot, the AI pair programmer that suggests code and entire functions in real-time.'
);

-- Create product reviews table (optional for future use)
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for product reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);

-- Create trigger for product reviews updated_at
CREATE TRIGGER trigger_update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();
