export type LlmsLink = {
  id: string;
  path: string;
  title: string;
  description: string;
  section: 'main' | 'optional' | 'docs';
};

export type LlmsConfig = {
  siteName: string;
  tagline: string;
  includeOptional: boolean;
  includeDocs: boolean;
  enabledLinkIds: string[];
  customLinks: { title: string; path: string; description: string; section: 'main' | 'optional' | 'docs' }[];
  extraMarkdown: string;
  mode: 'builder' | 'raw';
  rawContent: string;
};

export const LLMS_LINK_CATALOG: LlmsLink[] = [
  { id: 'home', path: '/', title: 'Home', description: 'Site home', section: 'main' },
  { id: 'models', path: '/models', title: 'Models', description: 'AI model catalog', section: 'main' },
  { id: 'datasets', path: '/datasets', title: 'Datasets', description: 'AI datasets', section: 'main' },
  { id: 'articles', path: '/articles', title: 'Articles', description: 'Technical articles', section: 'main' },
  { id: 'courses', path: '/courses', title: 'Courses', description: 'Learning courses', section: 'main' },
  { id: 'commands', path: '/commands', title: 'Commands', description: 'Linux / CLI commands', section: 'main' },
  { id: 'tutorials', path: '/tutorials', title: 'Tutorials', description: 'Step-by-step tutorials', section: 'main' },
  { id: 'news', path: '/news', title: 'News', description: 'Latest AI and tech news', section: 'main' },
  { id: 'about', path: '/about', title: 'About', description: 'About HackerThink', section: 'main' },
  { id: 'lab', path: '/lab-exercises', title: 'Lab Exercises', description: 'Hands-on labs', section: 'optional' },
  { id: 'scripts', path: '/scripts', title: 'Scripts', description: 'Scripts library', section: 'optional' },
  { id: 'tools', path: '/tools', title: 'Tools', description: 'Online utilities', section: 'optional' },
  { id: 'interviews', path: '/interviews', title: 'Interviews', description: 'Expert interviews', section: 'optional' },
  { id: 'glossary', path: '/glossary', title: 'Glossary', description: 'Tech glossary', section: 'optional' },
  { id: 'roadmap', path: '/learning-roadmap', title: 'Learning Roadmap', description: 'Learning paths', section: 'optional' },
  { id: 'community', path: '/community', title: 'Community', description: 'Community hub', section: 'optional' },
  { id: 'forum', path: '/forum', title: 'Forum', description: 'Discussion forum', section: 'optional' },
  { id: 'contact', path: '/contact', title: 'Contact', description: 'Contact', section: 'optional' },
  { id: 'faq', path: '/faq', title: 'FAQ', description: 'Frequently asked questions', section: 'optional' },
  { id: 'leaderboard', path: '/models/leaderboard', title: 'Model Leaderboard', description: 'Model rankings', section: 'docs' },
  { id: 'compare', path: '/models/compare', title: 'Compare Models', description: 'Side-by-side model comparison', section: 'docs' },
  { id: 'timeline', path: '/models/timeline', title: 'Model Timeline', description: 'Model release timeline', section: 'docs' },
  { id: 'datasets-leaderboard', path: '/datasets/leaderboard', title: 'Dataset Leaderboard', description: 'Dataset rankings', section: 'docs' },
  { id: 'privacy', path: '/privacy-policy', title: 'Privacy Policy', description: 'Privacy policy', section: 'docs' },
  { id: 'terms', path: '/terms-of-service', title: 'Terms of Service', description: 'Terms of service', section: 'docs' },
];

export function createDefaultLlmsConfig(): LlmsConfig {
  return {
    siteName: 'HackerThink',
    tagline: 'Learn Linux concepts, AI models, scripts, tutorials, and cybersecurity.',
    includeOptional: true,
    includeDocs: true,
    enabledLinkIds: LLMS_LINK_CATALOG.filter((l) => l.section === 'main' || l.section === 'optional').map(
      (l) => l.id
    ),
    customLinks: [],
    extraMarkdown: '',
    mode: 'builder',
    rawContent: '',
  };
}

function linkLine(title: string, path: string, description: string) {
  return `- [${title}](${path}): ${description}`;
}

export function generateLlmsTxt(config: LlmsConfig): string {
  if (config.mode === 'raw') {
    return config.rawContent || '';
  }

  const enabled = new Set(config.enabledLinkIds);
  const catalogBySection = {
    main: LLMS_LINK_CATALOG.filter((l) => l.section === 'main' && enabled.has(l.id)),
    optional: LLMS_LINK_CATALOG.filter((l) => l.section === 'optional' && enabled.has(l.id)),
    docs: LLMS_LINK_CATALOG.filter((l) => l.section === 'docs' && enabled.has(l.id)),
  };

  const custom = {
    main: config.customLinks.filter((l) => l.section === 'main'),
    optional: config.customLinks.filter((l) => l.section === 'optional'),
    docs: config.customLinks.filter((l) => l.section === 'docs'),
  };

  const lines: string[] = [`# ${config.siteName.trim() || 'Site'}`, ''];
  if (config.tagline.trim()) {
    lines.push(`> ${config.tagline.trim()}`, '');
  }

  const mainLinks = [...catalogBySection.main, ...custom.main];
  if (mainLinks.length) {
    lines.push('## Main', '');
    for (const l of mainLinks) {
      lines.push(linkLine(l.title, l.path, l.description));
    }
    lines.push('');
  }

  if (config.includeOptional) {
    const optionalLinks = [...catalogBySection.optional, ...custom.optional];
    if (optionalLinks.length) {
      lines.push('## Optional', '');
      for (const l of optionalLinks) {
        lines.push(linkLine(l.title, l.path, l.description));
      }
      lines.push('');
    }
  }

  if (config.includeDocs) {
    const docsLinks = [...catalogBySection.docs, ...custom.docs];
    if (docsLinks.length) {
      lines.push('## Docs', '');
      for (const l of docsLinks) {
        lines.push(linkLine(l.title, l.path, l.description));
      }
      lines.push('');
    }
  }

  if (config.extraMarkdown.trim()) {
    lines.push(config.extraMarkdown.trim(), '');
  }

  return `${lines.join('\n').trim()}\n`;
}
