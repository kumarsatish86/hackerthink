-- Persist rich course overview / body on shared content rows
ALTER TABLE content
  ADD COLUMN IF NOT EXISTS body TEXT;
