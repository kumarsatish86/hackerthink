import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Check if the skills column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roadmap_modules' AND column_name = 'skills'
    `;
    
    const checkResult = await query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      return NextResponse.json({ 
        message: 'Skills column already exists in roadmap_modules table',
        status: 'no_change'
      });
    }
    
    // Add the skills column
    const alterTableQuery = `
      ALTER TABLE roadmap_modules
      ADD COLUMN skills TEXT;
    `;
    
    await query(alterTableQuery);
    
    return NextResponse.json({ 
      message: 'Skills column added to roadmap_modules table successfully',
      status: 'success'
    });
  } catch (error) {
    console.error('Error adding skills column:', error);
    return NextResponse.json({ 
      error: 'Failed to add skills column to roadmap_modules table', 
      details: error.message 
    }, { status: 500 });
  }
} 
