import { getSeoTxtContent, plainTextResponse } from '@/lib/seo/txtFiles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const body = await getSeoTxtContent('llms');
  return plainTextResponse(body);
}
