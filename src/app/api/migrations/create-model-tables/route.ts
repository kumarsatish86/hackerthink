/**
 * @deprecated Prefer src/lib/migrations/sql + src/lib/migrations/runner.js
 * and POST /api/admin/models/migrations. This route remains as a no-op redirect notice.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    deprecated: true,
    message: 'Use POST /api/admin/models/migrations or node scripts/apply-models-migrations.mjs',
  });
}

export async function POST() {
  return NextResponse.json({
    deprecated: true,
    message: 'Use POST /api/admin/models/migrations or node scripts/apply-models-migrations.mjs',
  });
}
