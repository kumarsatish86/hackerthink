import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authConfig';
import { query } from '../../../../lib/db.js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== INDIVIDUAL MEDIA API CALLED ===');
  console.log('Params received:', params);
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('Session check:', session?.user?.role);
    
    if (!session || session.user?.role !== 'admin') {
      console.log('Authentication failed');
      return NextResponse.json(
        { error: 'You must be an admin to view media files' },
        { status: 403 }
      );
    }

    const { id } = params;
    console.log('Media ID requested:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    try {
      console.log('Executing database query for ID:', id);
      
      // Fetch specific media item from database
      const result = await query(`
        SELECT 
          m.id,
          m.filename,
          m.original_filename as "originalFilename",
          m.filepath,
          m.type,
          m.size,
          m.mime_type as "mimeType",
          m.alt_text as "alt",
          m.title,
          m.description,
          m.upload_date as "uploadedAt",
          m.uploaded_by as "uploadedBy"
        FROM media m
        WHERE m.id = $1::uuid
      `, [id]);
      
      console.log('Database query result rows:', result.rows.length);
      console.log('Database query result:', result.rows);
      
      if (result.rows.length === 0) {
        console.log('No media item found with ID:', id);
        return NextResponse.json(
          { error: 'Media item not found' },
          { status: 404 }
        );
      }

      const mediaItem = {
        ...result.rows[0],
        uploadedBy: result.rows[0].uploadedBy || 'Unknown',
        uploadedAt: result.rows[0].uploadedAt ? result.rows[0].uploadedAt.toISOString() : new Date().toISOString()
      };
      
      return NextResponse.json({ media: mediaItem });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching media item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media item' },
      { status: 500 }
    );
  }
}