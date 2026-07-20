/**
 * @deprecated Prefer src/lib/migrations/sql/001_models_module_rebuild.sql
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    deprecated: true,
    message: 'Use the models migration runner instead.',
  });
}

export async function POST() {
  return NextResponse.json({
    deprecated: true,
    message: 'Use the models migration runner instead.',
  });
}
