import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SEO_TXT_CONFIG, type SeoTxtKind } from '@/lib/seo/txtFileConfig';
import { getSeoTxtContent, upsertSeoTxtContent } from '@/lib/seo/txtFiles';

async function requireSession() {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized - Please sign in to continue' },
      { status: 401 }
    );
  }
  return null;
}

export function createSeoTxtAdminHandlers(kind: SeoTxtKind) {
  const config = SEO_TXT_CONFIG[kind];

  async function GET() {
    try {
      const denied = await requireSession();
      if (denied) return denied;
      const content = await getSeoTxtContent(kind);
      return NextResponse.json({ [config.responseField]: content });
    } catch (error) {
      console.error(`Error fetching ${config.publicPath}:`, error);
      return NextResponse.json(
        { message: 'Internal server error', details: String(error) },
        { status: 500 }
      );
    }
  }

  async function PUT(request: NextRequest) {
    try {
      const denied = await requireSession();
      if (denied) return denied;

      const body = await request.json();
      const value = body[config.responseField];
      if (value === undefined) {
        return NextResponse.json(
          { message: `${config.responseField} content is required` },
          { status: 400 }
        );
      }

      await upsertSeoTxtContent(kind, String(value));
      return NextResponse.json({ message: `${config.publicPath} updated successfully` });
    } catch (error) {
      console.error(`Error updating ${config.publicPath}:`, error);
      return NextResponse.json(
        { message: 'Internal server error', details: String(error) },
        { status: 500 }
      );
    }
  }

  return { GET, PUT };
}
