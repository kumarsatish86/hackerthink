-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status BOOLEAN DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, type, name)
);

-- Create index on provider and type for faster lookups
CREATE INDEX IF NOT EXISTS idx_integrations_provider_type ON integrations(provider, type);

-- Insert default integration records
INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('google', 'analytics', 'Google Analytics', false, '{"trackingId": "", "anonymizeIp": true, "sendPageViews": true}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('google', 'tagmanager', 'Google Tag Manager', false, '{"containerId": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('google', 'search_console', 'Google Search Console', false, '{"verificationCode": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('google', 'adsense', 'Google AdSense', false, '{"clientId": "", "slotId": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('microsoft', 'clarity', 'Microsoft Clarity', false, '{"projectId": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('microsoft', 'webmaster', 'Microsoft Webmaster', false, '{"verificationCode": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

-- Add Microsoft Azure AD integration
INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('microsoft', 'azure_ad', 'Microsoft Azure AD', false, '{"tenantId": "", "clientId": "", "clientSecret": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

-- Add Microsoft Office 365 integration
INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('microsoft', 'office365', 'Microsoft Office 365', false, '{"apiKey": "", "syncUsers": false}')
ON CONFLICT (provider, type, name) DO NOTHING;

-- Add Microsoft Teams integration
INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('microsoft', 'teams', 'Microsoft Teams', false, '{"webhookUrl": "", "sendNotifications": false}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('openai', 'api', 'OpenAI GPT', false, '{"apiKey": "", "model": "gpt-4", "temperature": 0.7, "maxTokens": 1000}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('anthropic', 'api', 'Anthropic Claude', false, '{"apiKey": "", "model": "claude-3-opus", "temperature": 0.7, "maxTokens": 1000}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('deepseek', 'api', 'DeepSeek AI', false, '{"apiKey": "", "model": "deepseek-coder", "temperature": 0.7, "maxTokens": 1000}')
ON CONFLICT (provider, type, name) DO NOTHING;

-- Add Analytics integrations
INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('analytics', 'matomo', 'Matomo Analytics', false, '{"url": "", "siteId": "", "disableCookies": false}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('analytics', 'plausible', 'Plausible Analytics', false, '{"domain": "", "scriptUrl": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('analytics', 'fathom', 'Fathom Analytics', false, '{"siteId": "", "customDomain": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

-- Add Other service integrations
INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('other', 'stripe', 'Stripe Payments', false, '{"publicKey": "", "secretKey": "", "testMode": true}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('other', 'mailchimp', 'Mailchimp', false, '{"apiKey": "", "listId": ""}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('other', 'slack', 'Slack Notifications', false, '{"webhookUrl": "", "channel": "", "signupNotifications": false}')
ON CONFLICT (provider, type, name) DO NOTHING;

INSERT INTO integrations (provider, type, name, status, config)
VALUES 
  ('other', 'custom', 'Custom Integration', false, '{"endpoint": "", "apiKey": "", "headers": {}}')
ON CONFLICT (provider, type, name) DO NOTHING; 