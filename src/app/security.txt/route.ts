import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/** RFC 9116 also allows /security.txt as a redirect to /.well-known/security.txt */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/.well-known/security.txt', request.url), 301);
}
