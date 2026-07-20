import { getSeoSetting, upsertSeoSetting } from '@/lib/seo/seoSettingsDb';
import { createDefaultRobotsConfig, generateRobotsTxt } from '@/lib/seo/robotsConfig';
import { plainTextResponse } from '@/lib/seo/txtFiles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const stored = await getSeoSetting('default_robots_txt');
  if (stored && stored.trim()) {
    return plainTextResponse(stored);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackerthink.com';
  const generated = generateRobotsTxt(createDefaultRobotsConfig(siteUrl));
  // Best-effort seed so admin and public stay aligned
  try {
    await upsertSeoSetting('default_robots_txt', generated, 'Default robots.txt content');
  } catch {
    /* ignore seed failures on read path */
  }
  return plainTextResponse(generated);
}
