-- Add publish_date, update_date, and schedule_date columns to articles table if they don't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS update_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS schedule_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date);
CREATE INDEX IF NOT EXISTS idx_articles_update_date ON articles(update_date);
CREATE INDEX IF NOT EXISTS idx_articles_schedule_date ON articles(schedule_date);

