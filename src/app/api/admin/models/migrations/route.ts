import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { applyPendingMigrations, getMigrationStatus } from '@/lib/migrations/runner';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin')) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const status = await getMigrationStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Migration status error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await applyPendingMigrations();
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error('Migration apply error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
