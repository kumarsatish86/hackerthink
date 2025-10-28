import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tutorialSlug: string } }
) {
  return NextResponse.json({ 
    message: 'Dynamic route test working',
    tutorialSlug: params.tutorialSlug,
    timestamp: new Date().toISOString()
  });
}
