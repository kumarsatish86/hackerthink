import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createDefaultRobotsConfig, generateRobotsTxt, type RobotsConfig } from '@/lib/seo/robotsConfig';
import { getSeoSetting, upsertSeoSetting } from '@/lib/seo/seoSettingsDb';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const [robotsTxt, configJson] = await Promise.all([
      getSeoSetting('default_robots_txt'),
      getSeoSetting('robots_txt_config'),
    ]);

    let config: RobotsConfig | null = null;
    if (configJson) {
      try {
        config = { ...createDefaultRobotsConfig(), ...JSON.parse(configJson) };
      } catch {
        config = null;
      }
    }

    return NextResponse.json({
      robots_txt: robotsTxt || generateRobotsTxt(createDefaultRobotsConfig()),
      config,
    });
  } catch (error) {
    console.error('Error fetching robots.txt settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const body = await request.json();
    const { robots_txt, config } = body;

    if (robots_txt === undefined && !config) {
      return NextResponse.json(
        { message: 'robots_txt or config is required' },
        { status: 400 }
      );
    }

    const nextConfig: RobotsConfig = config
      ? { ...createDefaultRobotsConfig(), ...config }
      : { ...createDefaultRobotsConfig(), mode: 'raw', rawContent: String(robots_txt || '') };

    const content =
      robots_txt !== undefined ? String(robots_txt) : generateRobotsTxt(nextConfig);

    await upsertSeoSetting('default_robots_txt', content, 'Default robots.txt content');
    await upsertSeoSetting(
      'robots_txt_config',
      JSON.stringify({ ...nextConfig, rawContent: content }),
      'Structured robots.txt builder config'
    );

    return NextResponse.json({ message: 'robots.txt updated successfully' });
  } catch (error) {
    console.error('Error updating robots.txt settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
