export type BotPolicy = 'inherit' | 'allow' | 'block';

export type RobotsBotId =
  | 'googlebot'
  | 'bingbot'
  | 'yandex'
  | 'duckduckbot'
  | 'applebot'
  | 'gptbot'
  | 'chatgpt_user'
  | 'google_extended'
  | 'claudebot'
  | 'anthropic_ai'
  | 'perplexitybot'
  | 'bytespider'
  | 'ccbot'
  | 'facebookbot'
  | 'twitterbot'
  | 'linkedinbot'
  | 'amazonbot'
  | 'cohere_ai'
  | 'meta_externalagent';

export type RobotsConfig = {
  allowRoot: boolean;
  includeSitemap: boolean;
  sitemapUrl: string;
  includeHost: boolean;
  host: string;
  crawlDelay: number | null;
  disallowPaths: string[];
  allowPaths: string[];
  customRules: string;
  bots: Record<RobotsBotId, BotPolicy>;
  mode: 'builder' | 'raw';
  rawContent: string;
};

export const ROBOTS_PATH_PRESETS: { path: string; label: string; group: string }[] = [
  { path: '/admin/', label: 'Admin panel', group: 'Private' },
  { path: '/api/', label: 'API routes', group: 'Private' },
  { path: '/_next/', label: 'Next.js assets', group: 'Private' },
  { path: '/private/', label: 'Private area', group: 'Private' },
  { path: '/dashboard/', label: 'User dashboard', group: 'Private' },
  { path: '/auth/', label: 'Auth pages', group: 'Private' },
  { path: '/account/', label: 'Account pages', group: 'Private' },
  { path: '/settings/', label: 'Settings', group: 'Private' },
  { path: '/search', label: 'Search results', group: 'Utility' },
  { path: '/search?', label: 'Search query URLs', group: 'Utility' },
  { path: '/*?*', label: 'URLs with query strings', group: 'Utility' },
  { path: '/tmp/', label: 'Temporary files', group: 'Utility' },
  { path: '/draft/', label: 'Draft content', group: 'Content' },
  { path: '/preview/', label: 'Preview pages', group: 'Content' },
  { path: '/cdn-cgi/', label: 'CDN CGI', group: 'Infrastructure' },
];

export const ROBOTS_ALLOW_PRESETS: { path: string; label: string }[] = [
  { path: '/', label: 'Entire site (/)' },
  { path: '/models/', label: 'AI Models' },
  { path: '/articles/', label: 'Articles' },
  { path: '/datasets/', label: 'Datasets' },
  { path: '/courses/', label: 'Courses' },
  { path: '/news/', label: 'News' },
  { path: '/commands/', label: 'Commands' },
  { path: '/tutorials/', label: 'Tutorials' },
];

export const ROBOTS_BOTS: {
  id: RobotsBotId;
  userAgent: string;
  label: string;
  category: 'Search' | 'AI' | 'Social' | 'Other';
  description: string;
}[] = [
  { id: 'googlebot', userAgent: 'Googlebot', label: 'Googlebot', category: 'Search', description: 'Google Search' },
  { id: 'bingbot', userAgent: 'Bingbot', label: 'Bingbot', category: 'Search', description: 'Microsoft Bing' },
  { id: 'yandex', userAgent: 'Yandex', label: 'Yandex', category: 'Search', description: 'Yandex Search' },
  { id: 'duckduckbot', userAgent: 'DuckDuckBot', label: 'DuckDuckBot', category: 'Search', description: 'DuckDuckGo' },
  { id: 'applebot', userAgent: 'Applebot', label: 'Applebot', category: 'Search', description: 'Apple / Siri' },
  { id: 'gptbot', userAgent: 'GPTBot', label: 'GPTBot', category: 'AI', description: 'OpenAI training crawler' },
  { id: 'chatgpt_user', userAgent: 'ChatGPT-User', label: 'ChatGPT-User', category: 'AI', description: 'ChatGPT browsing' },
  { id: 'google_extended', userAgent: 'Google-Extended', label: 'Google-Extended', category: 'AI', description: 'Gemini / Vertex AI training' },
  { id: 'claudebot', userAgent: 'ClaudeBot', label: 'ClaudeBot', category: 'AI', description: 'Anthropic Claude crawler' },
  { id: 'anthropic_ai', userAgent: 'anthropic-ai', label: 'anthropic-ai', category: 'AI', description: 'Anthropic AI' },
  { id: 'perplexitybot', userAgent: 'PerplexityBot', label: 'PerplexityBot', category: 'AI', description: 'Perplexity AI' },
  { id: 'bytespider', userAgent: 'Bytespider', label: 'Bytespider', category: 'AI', description: 'ByteDance / TikTok AI' },
  { id: 'ccbot', userAgent: 'CCBot', label: 'CCBot', category: 'AI', description: 'Common Crawl' },
  { id: 'cohere_ai', userAgent: 'cohere-ai', label: 'cohere-ai', category: 'AI', description: 'Cohere' },
  { id: 'meta_externalagent', userAgent: 'meta-externalagent', label: 'meta-externalagent', category: 'AI', description: 'Meta AI' },
  { id: 'amazonbot', userAgent: 'Amazonbot', label: 'Amazonbot', category: 'Other', description: 'Amazon' },
  { id: 'facebookbot', userAgent: 'FacebookBot', label: 'FacebookBot', category: 'Social', description: 'Facebook link preview' },
  { id: 'twitterbot', userAgent: 'Twitterbot', label: 'Twitterbot', category: 'Social', description: 'X / Twitter cards' },
  { id: 'linkedinbot', userAgent: 'LinkedInBot', label: 'LinkedInBot', category: 'Social', description: 'LinkedIn previews' },
];

function defaultBots(): Record<RobotsBotId, BotPolicy> {
  return Object.fromEntries(ROBOTS_BOTS.map((b) => [b.id, 'inherit'])) as Record<RobotsBotId, BotPolicy>;
}

export function createDefaultRobotsConfig(siteUrl = 'https://hackerthink.com'): RobotsConfig {
  return {
    allowRoot: true,
    includeSitemap: true,
    sitemapUrl: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
    includeHost: false,
    host: siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    crawlDelay: null,
    disallowPaths: ['/admin/', '/api/', '/_next/', '/private/'],
    allowPaths: ['/'],
    customRules: '',
    bots: defaultBots(),
    mode: 'builder',
    rawContent: '',
  };
}

export function generateRobotsTxt(config: RobotsConfig): string {
  if (config.mode === 'raw') {
    return config.rawContent || '';
  }

  const lines: string[] = [
    '# robots.txt — generated by HackerThink SEO admin',
    'User-agent: *',
  ];

  if (config.allowRoot || config.allowPaths.includes('/')) {
    lines.push('Allow: /');
  }

  for (const path of config.allowPaths) {
    if (path !== '/') lines.push(`Allow: ${path}`);
  }

  for (const path of config.disallowPaths) {
    lines.push(`Disallow: ${path}`);
  }

  if (config.crawlDelay != null && config.crawlDelay > 0) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`);
  }

  lines.push('');

  for (const bot of ROBOTS_BOTS) {
    const policy = config.bots[bot.id] || 'inherit';
    if (policy === 'inherit') continue;
    lines.push(`User-agent: ${bot.userAgent}`);
    if (policy === 'block') {
      lines.push('Disallow: /');
    } else {
      lines.push('Allow: /');
    }
    lines.push('');
  }

  if (config.customRules.trim()) {
    lines.push('# Custom rules');
    lines.push(config.customRules.trim());
    lines.push('');
  }

  if (config.includeHost && config.host.trim()) {
    lines.push(`Host: ${config.host.trim()}`);
  }

  if (config.includeSitemap && config.sitemapUrl.trim()) {
    lines.push(`Sitemap: ${config.sitemapUrl.trim()}`);
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function togglePath(list: string[], path: string, enabled: boolean): string[] {
  const set = new Set(list);
  if (enabled) set.add(path);
  else set.delete(path);
  return [...set];
}
