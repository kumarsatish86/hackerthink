export type SitemapContentType = {
  id: string;
  label: string;
  description: string;
  group: 'Core' | 'Learning' | 'AI' | 'Media' | 'Community';
  defaultChangefreq: string;
  defaultPriority: string;
};

export type SitemapTypeOverride = {
  enabled: boolean;
  changefreq: string;
  priority: string;
};

export type SitemapAdvancedConfig = {
  generate_sitemap: boolean;
  sitemap_change_frequency: string;
  sitemap_priority: string;
  include_homepage: boolean;
  include_static_pages: boolean;
  static_pages: string[];
  ping_search_engines: boolean;
  include_lastmod: boolean;
  include_images: boolean;
  types: Record<string, SitemapTypeOverride>;
};

export const SITEMAP_CONTENT_TYPES: SitemapContentType[] = [
  { id: 'articles', label: 'Articles', description: 'Published article pages', group: 'Core', defaultChangefreq: 'weekly', defaultPriority: '0.8' },
  { id: 'news', label: 'News', description: 'News posts', group: 'Core', defaultChangefreq: 'daily', defaultPriority: '0.7' },
  { id: 'commands', label: 'Commands', description: 'CLI / Linux command pages', group: 'Core', defaultChangefreq: 'monthly', defaultPriority: '0.7' },
  { id: 'scripts', label: 'Scripts', description: 'Published script pages', group: 'Core', defaultChangefreq: 'monthly', defaultPriority: '0.7' },
  { id: 'tools', label: 'Tools', description: 'Utility / tool pages', group: 'Core', defaultChangefreq: 'monthly', defaultPriority: '0.6' },
  { id: 'courses', label: 'Courses', description: 'Course landing pages', group: 'Learning', defaultChangefreq: 'weekly', defaultPriority: '0.8' },
  { id: 'tutorials', label: 'Tutorials', description: 'Tutorial modules', group: 'Learning', defaultChangefreq: 'weekly', defaultPriority: '0.8' },
  { id: 'lessons', label: 'Lessons', description: 'Individual lessons', group: 'Learning', defaultChangefreq: 'monthly', defaultPriority: '0.6' },
  { id: 'lab-exercises', label: 'Lab Exercises', description: 'Hands-on labs', group: 'Learning', defaultChangefreq: 'monthly', defaultPriority: '0.6' },
  { id: 'quizzes', label: 'Quizzes', description: 'Quiz pages', group: 'Learning', defaultChangefreq: 'monthly', defaultPriority: '0.5' },
  { id: 'ai-models', label: 'AI Models', description: 'Model catalog pages', group: 'AI', defaultChangefreq: 'daily', defaultPriority: '0.9' },
  { id: 'ai-datasets', label: 'AI Datasets', description: 'Dataset catalog pages', group: 'AI', defaultChangefreq: 'weekly', defaultPriority: '0.8' },
  { id: 'web-stories', label: 'Web Stories', description: 'AMP / web stories', group: 'Media', defaultChangefreq: 'weekly', defaultPriority: '0.5' },
  { id: 'interviews', label: 'Interviews', description: 'Interview pages', group: 'Community', defaultChangefreq: 'weekly', defaultPriority: '0.6' },
];

export const SITEMAP_STATIC_PAGES = [
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/faq', label: 'FAQ' },
  { path: '/community', label: 'Community' },
  { path: '/glossary', label: 'Glossary' },
  { path: '/learning-roadmap', label: 'Learning Roadmap' },
  { path: '/models', label: 'Models index' },
  { path: '/datasets', label: 'Datasets index' },
  { path: '/articles', label: 'Articles index' },
  { path: '/courses', label: 'Courses index' },
  { path: '/news', label: 'News index' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms-of-service', label: 'Terms of Service' },
  { path: '/cookie-policy', label: 'Cookie Policy' },
  { path: '/accessibility', label: 'Accessibility' },
];

export const CHANGEFREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const;
export const PRIORITY_OPTIONS = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'] as const;

export function createDefaultSitemapConfig(includedCsv?: string): SitemapAdvancedConfig {
  const included = new Set(
    (includedCsv || SITEMAP_CONTENT_TYPES.map((t) => t.id).join(','))
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const types: Record<string, SitemapTypeOverride> = {};
  for (const t of SITEMAP_CONTENT_TYPES) {
    types[t.id] = {
      enabled: included.has(t.id),
      changefreq: t.defaultChangefreq,
      priority: t.defaultPriority,
    };
  }

  return {
    generate_sitemap: true,
    sitemap_change_frequency: 'weekly',
    sitemap_priority: '0.8',
    include_homepage: true,
    include_static_pages: true,
    static_pages: SITEMAP_STATIC_PAGES.map((p) => p.path),
    ping_search_engines: false,
    include_lastmod: true,
    include_images: false,
    types,
  };
}

export function sitemapConfigToLegacySettings(config: SitemapAdvancedConfig) {
  const include_in_sitemap = SITEMAP_CONTENT_TYPES.filter((t) => config.types[t.id]?.enabled)
    .map((t) => t.id)
    .join(',');

  return {
    generate_sitemap: config.generate_sitemap ? 'true' : 'false',
    sitemap_change_frequency: config.sitemap_change_frequency,
    sitemap_priority: config.sitemap_priority,
    include_in_sitemap,
  };
}

export function legacySettingsToSitemapConfig(
  settings: Record<string, string>,
  advancedJson?: string | null
): SitemapAdvancedConfig {
  if (advancedJson) {
    try {
      const parsed = JSON.parse(advancedJson) as SitemapAdvancedConfig;
      if (parsed?.types) return parsed;
    } catch {
      /* fall through */
    }
  }

  const base = createDefaultSitemapConfig(settings.include_in_sitemap);
  return {
    ...base,
    generate_sitemap: settings.generate_sitemap !== 'false',
    sitemap_change_frequency: settings.sitemap_change_frequency || base.sitemap_change_frequency,
    sitemap_priority: settings.sitemap_priority || base.sitemap_priority,
  };
}

export function summarizeSitemapConfig(config: SitemapAdvancedConfig): string {
  const enabled = SITEMAP_CONTENT_TYPES.filter((t) => config.types[t.id]?.enabled);
  const lines = [
    '# Sitemap configuration summary (not an XML file)',
    `# generate: ${config.generate_sitemap}`,
    `# default changefreq: ${config.sitemap_change_frequency}`,
    `# default priority: ${config.sitemap_priority}`,
    `# homepage: ${config.include_homepage}`,
    `# static pages: ${config.include_static_pages ? config.static_pages.length : 0}`,
    `# lastmod: ${config.include_lastmod}`,
    `# images: ${config.include_images}`,
    `# ping search engines: ${config.ping_search_engines}`,
    '#',
    '# Content types:',
    ...enabled.map(
      (t) =>
        `# - ${t.id}: changefreq=${config.types[t.id].changefreq} priority=${config.types[t.id].priority}`
    ),
  ];
  return `${lines.join('\n')}\n`;
}
