import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authConfig';
import { query, queryOne } from '../../../lib/db.js';

// Ensure media table exists
async function ensureMediaTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL,
        size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        alt_text TEXT,
        title VARCHAR(255),
        description TEXT,
        uploaded_by UUID,
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes if they don't exist
    await query(`CREATE INDEX IF NOT EXISTS idx_media_type ON media(type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_upload_date ON media(upload_date)`);
    
    console.log('Media table ensured');
  } catch (error) {
    console.error('Error ensuring media table:', error);
  }
}

// Define file type mapping
const MIME_TYPE_MAP: Record<string, string> = {
  'image/jpeg': 'images',
  'image/jpg': 'images',
  'image/png': 'images',
  'image/gif': 'images',
  'image/svg+xml': 'images',
  'image/webp': 'images',
  'application/pdf': 'documents',
  'application/msword': 'documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
  'application/vnd.ms-excel': 'documents',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'documents',
  'application/vnd.ms-powerpoint': 'documents',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'documents',
  'text/plain': 'documents',
  'application/json': 'webstories',
};

export async function POST(request: NextRequest) {
  try {
    // Ensure media table exists
    await ensureMediaTable();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You must be an admin to upload files' },
        { status: 403 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    const category = MIME_TYPE_MAP[fileType];
    
    if (!category) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', category);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    // Save the file
    const filePath = join(uploadDir, uniqueFilename);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    
    // Save file metadata to database
    const fileId = uuidv4();
    const uploadedFile = {
      id: fileId,
      filename: uniqueFilename,
      originalFilename,
      filepath: `/uploads/${category}/${uniqueFilename}`,
      type: category.slice(0, -1), // Remove 's' from the end (e.g., 'images' -> 'image')
      size: file.size,
      mimeType: fileType,
      uploadedBy: session.user?.email || 'unknown',
      uploadedAt: new Date().toISOString(),
    };

    try {
      // Insert into database
      // Try to find user ID, but don't fail if users table doesn't exist
      let userId = null;
      try {
        const userResult = await query(`SELECT id FROM users WHERE email = $1`, [session.user?.email]);
        userId = userResult.rows[0]?.id || null;
      } catch (userError) {
        console.log('Users table not found or error fetching user:', userError.message);
      }
      
      await query(`
        INSERT INTO media (
          id, filename, original_filename, filepath, type, size, mime_type, 
          title, uploaded_by, upload_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      `, [
        fileId,
        uniqueFilename,
        originalFilename,
        `/uploads/${category}/${uniqueFilename}`,
        category.slice(0, -1),
        file.size,
        fileType,
        originalFilename.replace(/\.[^/.]+$/, ''), // Title without extension
        userId
      ]);
      
      console.log(`Media file saved to database: ${fileId}`);
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue even if database save fails - file is already uploaded
    }
    
    // Return success response
    return NextResponse.json({ success: true, file: uploadedFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure media table exists
    await ensureMediaTable();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You must be an admin to view media files' },
        { status: 403 }
      );
    }

    try {
      // Fetch media items from database
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
        ORDER BY m.upload_date DESC
        LIMIT 100
      `);
      
      const mediaItems = result.rows.map(item => ({
        ...item,
        // Format the response to match the expected structure
        uploadedBy: item.uploadedBy || 'Unknown',
        uploadedAt: item.uploadedAt ? item.uploadedAt.toISOString() : new Date().toISOString(),
        // Add a flag to indicate if the file exists
        fileExists: true // We'll check this on the frontend
      }));
      
      return NextResponse.json({ media: mediaItems });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return empty array instead of fallback data to avoid confusion
      return NextResponse.json({ media: [] });
    }
  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}

// PUT method to update media metadata (alt text, title, description)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureMediaTable();

    const body = await request.json();
    const { id, alt_text, title, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Update media metadata
    const updateResult = await query(`
      UPDATE media 
      SET 
        alt_text = $1,
        title = $2,
        description = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [alt_text || null, title || null, description || null, id]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Media updated successfully',
      media: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// DELETE method to remove media files
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureMediaTable();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');

    if (!id && !ids) {
      return NextResponse.json({ error: 'Media ID(s) required' }, { status: 400 });
    }

    let mediaIds: string[] = [];
    
    if (ids) {
      // Bulk delete
      try {
        mediaIds = JSON.parse(ids);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid IDs format' }, { status: 400 });
      }
    } else if (id) {
      // Single delete
      mediaIds = [id];
    }

    // Get file paths before deletion for cleanup
    const mediaFiles = await query(`
      SELECT filepath FROM media WHERE id = ANY($1::uuid[])
    `, [mediaIds]);

    // Delete from database
    const deleteResult = await query(`
      DELETE FROM media WHERE id = ANY($1::uuid[])
      RETURNING id, filename
    `, [mediaIds]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'No media files found' }, { status: 404 });
    }

    // TODO: Optionally delete physical files from filesystem
    // Note: We might want to keep files for data recovery or if they're used elsewhere
    // For now, we'll just remove from database
    
    return NextResponse.json({
      message: `${deleteResult.rows.length} media file(s) deleted successfully`,
      deletedIds: deleteResult.rows.map(row => row.id)
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
} 
