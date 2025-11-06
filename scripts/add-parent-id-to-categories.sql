-- Add parent_id column to news_categories table
ALTER TABLE news_categories 
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES news_categories(id) ON DELETE SET NULL;

-- Add parent_id column to tutorial_categories table (id is UUID type)
ALTER TABLE tutorial_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES tutorial_categories(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_categories_parent_id ON news_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_categories_parent_id ON tutorial_categories(parent_id);

