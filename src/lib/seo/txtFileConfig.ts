export type SeoTxtKind = 'ads' | 'llms' | 'security';

export const SEO_TXT_CONFIG: Record<
  SeoTxtKind,
  {
    settingKey: string;
    responseField: string;
    publicPath: string;
    title: string;
    description: string;
    docsUrl: string;
    docsLabel: string;
    example: string;
    defaultValue: string;
  }
> = {
  ads: {
    settingKey: 'ads_txt',
    responseField: 'ads_txt',
    publicPath: '/ads.txt',
    title: 'Edit ads.txt',
    description: 'Authorize digital ad sellers for your domain (IAB ads.txt)',
    docsUrl: 'https://iabtechlab.com/ads-txt/',
    docsLabel: 'Learn more about ads.txt',
    example: `# ads.txt example
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
# Replace with your real publisher IDs`,
    defaultValue: `# ads.txt — list authorized digital sellers for this domain
# Format: <domain>, <publisher_account_id>, <relationship>, <certification_authority_id>
# Example:
# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
`,
  },
  llms: {
    settingKey: 'llms_txt',
    responseField: 'llms_txt',
    publicPath: '/llms.txt',
    title: 'Edit llms.txt',
    description: 'Guide AI crawlers and LLM tools to key content on your site',
    docsUrl: 'https://llmstxt.org/',
    docsLabel: 'Learn more about llms.txt',
    example: `# llms.txt example
# HackerThink

> Learn Linux, AI models, scripts, and cybersecurity.

## Docs
- [About](https://hackerthink.com/about): What HackerThink is
- [Models](https://hackerthink.com/models): AI model catalog
- [Articles](https://hackerthink.com/articles): Technical articles
`,
    defaultValue: `# HackerThink

> Learn Linux concepts, AI models, scripts, tutorials, and cybersecurity.

## Main
- [Home](/): Site home
- [Models](/models): AI model catalog
- [Datasets](/datasets): AI datasets
- [Articles](/articles): Technical articles
- [Courses](/courses): Learning courses
- [Commands](/commands): Linux / CLI commands
- [About](/about): About HackerThink

## Optional
- [Contact](/contact): Contact
- [FAQ](/faq): Frequently asked questions
`,
  },
  security: {
    settingKey: 'security_txt',
    responseField: 'security_txt',
    publicPath: '/.well-known/security.txt',
    title: 'Edit security.txt',
    description: 'Publish security contact and disclosure policy (RFC 9116)',
    docsUrl: 'https://securitytxt.org/',
    docsLabel: 'Learn more about security.txt',
    example: `Contact: mailto:security@example.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://example.com/.well-known/security.txt
Policy: https://example.com/security-policy
`,
    defaultValue: `Contact: mailto:security@hackerthink.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://hackerthink.com/.well-known/security.txt
# Policy: https://hackerthink.com/security-policy
# Acknowledgments: https://hackerthink.com/hall-of-fame
`,
  },
};
