import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createDefaultLlmsConfig, generateLlmsTxt, type LlmsConfig } from '@/lib/seo/llmsConfig';
import { getSeoSetting, upsertSeoSetting } from '@/lib/seo/seoSettingsDb';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const [llmsTxt, configJson] = await Promise.all([
      getSeoSetting('llms_txt'),
      getSeoSetting('llms_txt_config'),
    ]);

    let config: LlmsConfig | null = null;
    if (configJson) {
      try {
        config = { ...createDefaultLlmsConfig(), ...JSON.parse(configJson) };
      } catch {
        config = null;
      }
    }

    return NextResponse.json({
      llms_txt: llmsTxt || generateLlmsTxt(createDefaultLlmsConfig()),
      config,
    });
  } catch (error) {
    console.error('Error fetching llms.txt:', error);
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
    const { llms_txt, config } = body;

    if (llms_txt === undefined && !config) {
      return NextResponse.json({ message: 'llms_txt or config is required' }, { status: 400 });
    }

    const nextConfig: LlmsConfig = config
      ? { ...createDefaultLlmsConfig(), ...config }
      : { ...createDefaultLlmsConfig(), mode: 'raw', rawContent: String(llms_txt || '') };

    const content = llms_txt !== undefined ? String(llms_txt) : generateLlmsTxt(nextConfig);

    await upsertSeoSetting('llms_txt', content, 'llms.txt content');
    await upsertSeoSetting(
      'llms_txt_config',
      JSON.stringify({ ...nextConfig, rawContent: content }),
      'Structured llms.txt builder config'
    );

    return NextResponse.json({ message: '/llms.txt updated successfully' });
  } catch (error) {
    console.error('Error updating llms.txt:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
