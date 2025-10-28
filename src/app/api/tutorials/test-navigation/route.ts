import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Test navigation endpoint working',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

