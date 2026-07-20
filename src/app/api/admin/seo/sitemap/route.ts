import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createDefaultSitemapConfig,
  legacySettingsToSitemapConfig,
  sitemapConfigToLegacySettings,
  type SitemapAdvancedConfig,
} from '@/lib/seo/sitemapConfig';
import { upsertSeoSetting } from '@/lib/seo/seoSettingsDb';
import { query } from '@/lib/db';

function defaultIncludeCsv() {
  return Object.entries(createDefaultSitemapConfig().types)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k)
    .join(',');
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const { rows } = await query(`
      SELECT setting_key, setting_value
      FROM seo_settings
      WHERE setting_key IN (
        'generate_sitemap',
        'sitemap_change_frequency',
        'sitemap_priority',
        'include_in_sitemap',
        'sitemap_advanced_config'
      )
    `);

    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.setting_key] = row.setting_value;

    const config = legacySettingsToSitemapConfig(settings, settings.sitemap_advanced_config);
    const legacy = sitemapConfigToLegacySettings(config);

    return NextResponse.json({
      sitemap_settings: {
        generate_sitemap: settings.generate_sitemap ?? legacy.generate_sitemap,
        sitemap_change_frequency:
          settings.sitemap_change_frequency ?? legacy.sitemap_change_frequency,
        sitemap_priority: settings.sitemap_priority ?? legacy.sitemap_priority,
        include_in_sitemap: settings.include_in_sitemap ?? legacy.include_in_sitemap ?? defaultIncludeCsv(),
      },
      config,
    });
  } catch (error) {
    console.error('Error fetching sitemap settings:', error);
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
    let config: SitemapAdvancedConfig;

    if (body.config) {
      config = { ...createDefaultSitemapConfig(), ...body.config, types: body.config.types };
    } else if (body.sitemap_settings) {
      config = legacySettingsToSitemapConfig(body.sitemap_settings, null);
    } else {
      return NextResponse.json(
        { message: 'Invalid request. config or sitemap_settings is required.' },
        { status: 400 }
      );
    }

    const legacy = sitemapConfigToLegacySettings(config);

    await upsertSeoSetting('generate_sitemap', legacy.generate_sitemap, 'Whether to automatically generate sitemap');
    await upsertSeoSetting(
      'sitemap_change_frequency',
      legacy.sitemap_change_frequency,
      'Default change frequency for sitemap'
    );
    await upsertSeoSetting('sitemap_priority', legacy.sitemap_priority, 'Default priority for sitemap');
    await upsertSeoSetting(
      'include_in_sitemap',
      legacy.include_in_sitemap,
      'Content types to include in sitemap'
    );
    await upsertSeoSetting(
      'sitemap_advanced_config',
      JSON.stringify(config),
      'Advanced sitemap builder configuration'
    );
    await upsertSeoSetting(
      'sitemap_static_pages',
      JSON.stringify({
        include: config.include_static_pages,
        pages: config.static_pages,
        homepage: config.include_homepage,
        lastmod: config.include_lastmod,
        images: config.include_images,
        ping: config.ping_search_engines,
      }),
      'Static pages and extra sitemap options'
    );

    return NextResponse.json({ message: 'Sitemap settings updated successfully' });
  } catch (error) {
    console.error('Error updating sitemap settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
